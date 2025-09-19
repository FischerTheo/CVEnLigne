import User from '../models/User.js'
import { signToken } from '../utils/jwt.js'

export const register = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body
    const user = new User({ 
      username, 
      email: email || username, // Prefer provided email; fallback to username
      password,
      isAdmin: isAdmin || false
    })
    await user.save()
    
    // Create token and return it for auto-login
  const token = signToken({ userId: user._id })
  // Calcule la date d'expiration (1h)
  const expiresAt = Date.now() + 3600 * 1000
  res.status(201).json({ 
    message: 'User registered successfully', 
    token, 
    isAdmin: user.isAdmin,
    expiresAt
  })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }) // Find by email
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
  const token = signToken({ userId: user._id })
  // Calcule la date d'expiration (1h)
  const expiresAt = Date.now() + 3600 * 1000
  res.json({ token, isAdmin: user.isAdmin, expiresAt }) 
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}