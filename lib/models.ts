import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"

// User Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Task Schema - Updated with userId
const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    deadline: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0.5,
    },
    category: {
      type: String,
      trim: true,
    },
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
    reminderDate: Date,
  },
  {
    timestamps: true,
  },
)

// Create or retrieve models
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
export const TaskModel = mongoose.models.Task || mongoose.model("Task", taskSchema)

// Method to verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}
