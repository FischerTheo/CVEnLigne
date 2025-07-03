import mongoose from 'mongoose'
import userInfoSchema from './UserInfoSchema.js'

export default mongoose.model('UserInfoEn', userInfoSchema, 'userinfos_en')