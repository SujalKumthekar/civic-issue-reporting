import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const nagarpalikaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    taluka: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DistrictAuthority', required: true },
  },
  { timestamps: true }
);

nagarpalikaSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

nagarpalikaSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Nagarpalika = mongoose.model('Nagarpalika', nagarpalikaSchema);
export default Nagarpalika;
