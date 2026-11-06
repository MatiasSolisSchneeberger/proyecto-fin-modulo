import express, {type Request, type Response} from "express"

const app = express()
const port = 3000

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
	res.send({message: "Hola Mundo"})
})

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
