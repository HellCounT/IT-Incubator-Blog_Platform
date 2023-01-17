import bcrypt from 'bcrypt'
import {usersRepo} from "../repositories/users-database";
import {UserCreateType, UserInsertDbType, UserViewType} from "../types/types";
import {WithId} from "mongodb";
import {emailManager} from "../managers/email-manager";
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'

export const usersService = {
    async registerUser(login: string, password: string, email: string): Promise<UserViewType | null> {
        const passwordHash = await usersService._generateHash(password)
        const currentDate = new Date()
        const newUser: UserCreateType = {
            login: login,
            password: password,
            email: email,
            createdAt: currentDate.toISOString(),
            confirmationCode: uuidv4(),
            expirationDate: add(currentDate, {hours: 1}).toISOString(),
            isConfirmed: false
        }
        const createUserResult = await usersRepo.createUser(newUser, passwordHash)
        try {
            await emailManager.sendEmailRegistrationCode(newUser.email, newUser.confirmationCode)
        } catch (error) {
            console.error(error)
            await usersRepo.deleteUser(createUserResult.id)
            return null
        }
        return createUserResult
    },
    async createUser(login: string, password: string, email: string): Promise<UserViewType | null> {
        const passwordHash = await usersService._generateHash(password)
        const currentDate = new Date()
        const newUser: UserCreateType = {
            login: login,
            password: password,
            email: email,
            createdAt: currentDate.toISOString(),
            confirmationCode: "User Created by SuperAdmin",
            expirationDate: "User Created by SuperAdmin",
            isConfirmed: true
        }
        return await usersRepo.createUser(newUser, passwordHash)
    },
    async deleteUser(id: string): Promise<boolean | null> {
        return await usersRepo.deleteUser(id)
    },
    async checkCredentials(loginOrEmail: string, password: string): Promise<WithId<UserInsertDbType> | null> {
        const foundUser = await usersRepo.findByLoginOrEmail(loginOrEmail)
        if (!foundUser) return null
        if (!foundUser.emailConfirmationData.isConfirmed) return null
        else {
            //const passwordHash = await usersService._generateHash(password)
            if (await bcrypt.compare(password, foundUser.accountData.hash)) return foundUser
            else return null
        }
    },
    async confirmUserEmail(code: string): Promise<boolean> {
        const foundUser = await usersRepo.findByConfirmationCode(code)
        console.log(foundUser)
        if (!foundUser) return false
        if (foundUser.emailConfirmationData.isConfirmed) return false
        if (foundUser.emailConfirmationData.confirmationCode !== code) return false
        if (new Date(foundUser.emailConfirmationData.expirationDate) < new Date()) return false
        return await usersRepo.confirmUser(foundUser._id.toString())
    },
    async resendActivationCode(email: string): Promise<boolean> {
        const foundUser = await usersRepo.findByLoginOrEmail(email)
        if (!foundUser) return false
        if (foundUser.emailConfirmationData.isConfirmed) return false
        try {
            await emailManager.resendEmailRegistrationCode(foundUser.accountData.email, foundUser.emailConfirmationData.confirmationCode)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    },
    async _generateHash(password: string) {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    }
}
