const mongoose = require('mongoose');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

// @desc    Submit an application for an opportunity
// @route   POST /api/applications
// @access  Public / Authenticated
exports.submit = async (req, res, next) => {
  try {
    const { opportunityId, opportunity, applicantName, email, phone, resumeLink, coverLetter } = req.body;
    const targetOpportunityId = opportunityId || opportunity;

    if (!targetOpportunityId || !applicantName || !email || !phone || !resumeLink) {
      return res.status(400).json({
        message: 'Please fill in all mandatory fields: Applicant Name, Email, Phone Number, Resume URL, and Opportunity ID.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetOpportunityId)) {
      return res.status(400).json({ message: 'Invalid Opportunity ID format.' });
    }

    const existingOpp = await Opportunity.findById(targetOpportunityId);
    if (!existingOpp) {
      return res.status(404).json({ message: 'The opportunity you are applying for no longer exists.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent duplicate applications for the same opportunity with the same email
    const duplicate = await Application.findOne({
      opportunityId: existingOpp._id,
      email: normalizedEmail
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'You have already submitted an application for this opportunity.'
      });
    }

    const createdApp = await Application.create({
      opportunityId: existingOpp._id,
      opportunity: existingOpp._id,
      userId: req.user ? req.user._id : null,
      opportunitySnapshot: {
        title: existingOpp.title,
        companyName: existingOpp.companyName,
        domain: existingOpp.domain,
        location: existingOpp.location,
        type: existingOpp.type || 'Internship'
      },
      applicantName: applicantName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      resumeLink: resumeLink.trim(),
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'Pending',
      appliedAt: new Date()
    });

    const populatedApp = await Application.findById(createdApp._id)
      .populate('opportunityId', 'title companyName domain location type stipendOrSalary')
      .populate('opportunity', 'title companyName domain location type stipendOrSalary');

    return res.status(201).json({
      message: 'Application submitted successfully!',
      data: populatedApp
    });
  } catch (err) {
    res.status(400);
    next(err);
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private/Admin
exports.getAll = async (req, res, next) => {
  try {
    const { search, opportunityId, status } = req.query;
    const filter = {};

    if (opportunityId && mongoose.Types.ObjectId.isValid(opportunityId)) {
      filter.opportunityId = opportunityId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { applicantName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'opportunitySnapshot.title': { $regex: q, $options: 'i' } },
        { 'opportunitySnapshot.companyName': { $regex: q, $options: 'i' } }
      ];
    }

    const apps = await Application.find(filter)
      .populate('opportunityId', 'title companyName domain location type stipendOrSalary')
      .populate('opportunity', 'title companyName domain location type stipendOrSalary')
      .sort({ appliedAt: -1, createdAt: -1 });

    const formatted = apps.map((doc) => {
      const obj = doc.toObject();
      const resolvedOpp = obj.opportunityId || obj.opportunity || (
        obj.opportunitySnapshot && obj.opportunitySnapshot.title
          ? {
              _id: null,
              title: `${obj.opportunitySnapshot.title} (Archived)`,
              companyName: obj.opportunitySnapshot.companyName || 'N/A',
              domain: obj.opportunitySnapshot.domain || 'N/A',
              location: obj.opportunitySnapshot.location || 'N/A',
              isDeleted: true
            }
          : {
              _id: null,
              title: 'Removed Opportunity',
              companyName: 'N/A',
              domain: 'N/A',
              location: 'N/A',
              isDeleted: true
            }
      );

      return {
        ...obj,
        opportunityId: resolvedOpp,
        opportunity: resolvedOpp
      };
    });

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Get applications submitted by logged-in user
// @route   GET /api/applications/my-applications
// @access  Private
exports.getMyApplications = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const apps = await Application.find({
      $or: [{ userId: req.user._id }, { email: userEmail }]
    })
      .populate('opportunityId', 'title companyName domain location type stipendOrSalary')
      .populate('opportunity', 'title companyName domain location type stipendOrSalary')
      .sort({ appliedAt: -1, createdAt: -1 });

    const formatted = apps.map((doc) => {
      const obj = doc.toObject();
      const resolvedOpp = obj.opportunityId || obj.opportunity || {
        _id: null,
        title: obj.opportunitySnapshot?.title || 'Opportunity',
        companyName: obj.opportunitySnapshot?.companyName || 'N/A',
        domain: obj.opportunitySnapshot?.domain || 'N/A',
        location: obj.opportunitySnapshot?.location || 'N/A',
        isDeleted: true
      };

      return {
        ...obj,
        opportunityId: resolvedOpp,
        opportunity: resolvedOpp
      };
    });

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Update application review status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found (Invalid ID format)' });
    }

    const validStatuses = ['Pending', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const updatedApp = await Application.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    })
      .populate('opportunityId', 'title companyName domain location type')
      .populate('opportunity', 'title companyName domain location type');

    if (!updatedApp) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.status(200).json({
      message: 'Application status updated successfully.',
      data: updatedApp
    });
  } catch (err) {
    res.status(400);
    next(err);
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private/Admin
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Application not found (Invalid ID format)' });
    }

    const app = await Application.findByIdAndDelete(id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json({ message: 'Application deleted successfully', deletedId: id });
  } catch (err) {
    next(err);
  }
};
