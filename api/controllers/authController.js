import User from '../models/User.js'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body // Accept email
    const user = new User({ username, email, password }) // Save email
    await user.save()
    res.status(201).json({ message: 'User registered' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }) // Find by email
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
    res.json({ token, isAdmin: user.isAdmin }) 
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}