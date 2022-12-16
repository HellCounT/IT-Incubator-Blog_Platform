import express, {Request, Response} from "express"
import {blogsDb} from "./repositories/blogs-repo"
import {postsDb} from "./repositories/posts-repo"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

type FieldError = {
    message: string,
    field: string
}
type APIErrorResult = Array<FieldError>

app.get('/api/blogs', (req: Request, res: Response) => {
    res.send(blogsDb).status(200);
})

app.post('/api/blogs', (req: Request, res: Response) => {

})

app.get('/api/blogs/:id', (req: Request, res: Response) => {

})

app.put('/api/blogs/:id', (req: Request, res: Response) => {

})

app.delete('/api/blogs/:id', (req: Request, res: Response) => {

})


app.get('/api/posts', (req: Request, res: Response) => {
    res.send(postsDb).status(200)
})

app.post('/api/posts', (req: Request, res: Response) => {

})

app.get('/api/posts/:id', (req: Request, res: Response) => {

})

app.put('/api/posts/:id', (req: Request, res: Response) => {

})

app.delete('/api/posts/:id', (req: Request, res: Response) => {

})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})