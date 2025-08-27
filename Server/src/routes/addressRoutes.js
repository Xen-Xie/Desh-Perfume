import express from "express"
import { addAddress, deleteAddress, getAddress, updateAddress } from "../controllers/addressController.js"


const router = express.Router()


router.post('/add',addAddress)
router.get('/get', getAddress)
router.patch('/update/:id',updateAddress)
router.delete('/delete/:id',deleteAddress)


export default router