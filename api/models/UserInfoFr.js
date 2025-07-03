import mongoose from 'mongoose'
import userInfoSchema from './UserInfoSchema.js'

export default mongoose.model('UserInfoFr', userInfoSchema, 'userinfos_fr')