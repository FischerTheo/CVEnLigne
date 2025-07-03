import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import UserInfoFr from '../models/UserInfoFr.js'
import UserInfoEn from '../models/UserInfoEn.js'
import { translateUserInfo } from '../middlewares/translateUserInfo.js'

const getUserId = (req) => {
  const auth = req.headers.authorization
  if (!auth) return null
  try {
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  } catch {
    return null
  }
}

export const getUserInfo = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const lang = req.query.lang
  let info
  if (lang === 'en') {
    info = await UserInfoEn.findOne({ user: userId })
  } else {
    info = await UserInfoFr.findOne({ user: userId })
  }
  res.json(info || {}) // Always return an object
}

export const updateUserInfo = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const lang = req.query.lang
  const { _id, ...bodyWithoutId } = req.body
  const form = { ...bodyWithoutId, user: userId }

  if (lang === 'en') {
    // Save directly to English, do not translate
    await UserInfoEn.findOneAndUpdate(
      { user: userId },
      form,
      { upsert: true, new: true }
    )
    res.json({ message: 'Saved in English collection only' })
  } else {
    // Save French and translate to English
    await UserInfoFr.findOneAndUpdate(
      { user: userId },
      form,
      { upsert: true, new: true }
    )
    const formEn = await translateUserInfo(form)
    formEn.user = userId
    await UserInfoEn.findOneAndUpdate(
      { user: userId },
      formEn,
      { upsert: true, new: true }
    )
    res.json({ message: 'Saved in both collections' })
  }
}

export const getAdminUserInfo = async (req, res) => {
  const adminUser = await User.findOne({ isAdmin: true })
  if (!adminUser) return res.status(404).json({ error: 'Admin user not found' })

  // Check for ?lang=en
  const lang = req.query.lang
  let info
  if (lang === 'en') {
    info = await UserInfoEn.findOne({ user: adminUser._id })
  } else {
    info = await UserInfoFr.findOne({ user: adminUser._id })
  }
  res.json(info || {}) // Always return an object
}