import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const districtAuthoritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    districtName: { type: String, required: true },
  },
  { timestamps: true }
);

districtAuthoritySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

districtAuthoritySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const DistrictAuthority = mongoose.model('DistrictAuthority', districtAuthoritySchema);
export default DistrictAuthority;
