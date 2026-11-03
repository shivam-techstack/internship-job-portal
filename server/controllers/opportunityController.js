const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities with search and filtering
// @route   GET /api/opportunities
// @access  Public
exports.getAll = async (req, res, next) => {
  try {
    const { search, domain, type } = req.query;
    const filter = {};

    if (domain && domain.trim() !== '' && domain !== 'All') {
      filter.domain = { $regex: `^${domain.trim()}$`, $options: 'i' };
    }

    if (type && type.trim() !== '' && type !== 'All') {
      filter.type = { $regex: `^${type.trim()}$`, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { domain: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(opportunities);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Opportunity not found (Invalid ID format)' });
    }
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    return res.status(200).json(opp);
  } catch (err) {
    next(err);
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private/Admin
exports.create = async (req, res, next) => {
  try {
    const { title, companyName, domain, location, experience, description, applicationLink, type, stipendOrSalary } = req.body;

    if (!title || !companyName || !domain || !location || !experience || !description || !applicationLink) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, companyName, domain, location, experience, description, and applicationLink.'
      });
    }

    const opp = await Opportunity.create({
      title: title.trim(),
      companyName: companyName.trim(),
      domain: domain.trim(),
      location: location.trim(),
      experience: experience.trim(),
      description: description.trim(),
      applicationLink: applicationLink.trim(),
      type: type || 'Internship',
      stipendOrSalary: stipendOrSalary ? stipendOrSalary.trim() : 'Competitive',
      createdBy: req.user ? req.user._id : null
    });

    return res.status(201).json(opp);
  } catch (err) {
    res.status(400);
    next(err);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Admin
exports.update = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Opportunity not found (Invalid ID format)' });
    }

    const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    return res.status(200).json(opp);
  } catch (err) {
    res.status(400);
    next(err);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private/Admin
exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Opportunity not found (Invalid ID format)' });
    }

    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    return res.status(200).json({ message: 'Opportunity deleted successfully', deletedId: req.params.id });
  } catch (err) {
    next(err);
  }
};
