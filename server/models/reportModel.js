const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    detectedIssue: {
      type: String,
      trim: true,
    },

    confidence: {
      type: Number,
    },

    severityPrediction: {
      type: String,
      enum: ["low", "medium", "high"],
    },
  },
  { _id: false }
);


const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: [
        "pothole",
        "garbage",
        "streetlight",
        "drainage",
        "water_leak",
        "road_damage",
        "electric_pole",
        "traffic_signal",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    images: {
  type: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
  ],
  default: [],
  validate: {
    validator: (v) => v.length <= 5,
    message: "Maximum 5 images allowed",
  },
},

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    municipality: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    locationName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },

    annotatedImage: {
      type: String,
      default: null,
    },

    aiAnalysis: {
      type: aiAnalysisSchema,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// INDEXES
reportSchema.index({ location: "2dsphere" });

reportSchema.index({ category: 1 });

reportSchema.index({ municipality: 1, status: 1 });

reportSchema.index({ reportedBy: 1, createdAt: -1 });

reportSchema.index({ status: 1, createdAt: -1 });


// AUTO HANDLE resolvedAt
reportSchema.pre("save", function (next) {

  if (this.isModified("status")) {

    if (this.status === "resolved") {
      this.resolvedAt = new Date();
    } else {
      this.resolvedAt = null;
    }

  }

  next();
});

reportSchema.methods.toggleUpvote = function (userId) {
  const id = userId.toString();

  const index = this.upvotes.findIndex(
    (u) => u.toString() === id
  );

  if (index === -1) {
    this.upvotes.push(userId);
    return true;
  } else {
    this.upvotes.splice(index, 1);
    return false;
  }
};

reportSchema.pre("save", function (next) {
  this.upvoteCount = this.upvotes.length;
  next();
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;