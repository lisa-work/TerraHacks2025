import { Request, Response, NextFunction } from 'express';
import InsuranceProvider from '../models/InsuranceProvider';
import { AuthRequest } from '../middleware/auth';
import { generateAIInsuranceMatch } from '../services/aiService';

// @desc    Search insurance providers
// @route   GET /api/insurance/search?q=query&state=STATE
// @access  Public
export const searchInsuranceProviders = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { q: query, state, type = 'health' } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // First, try to find exact or close matches
    let providers = await InsuranceProvider.find({
      $and: [
        { isActive: true },
        { type },
        ...(state ? [{ states: state as string }] : []),
        {
          $or: [
            { name: { $regex: query as string, $options: 'i' } },
            { searchKeywords: { $in: [(query as string).toLowerCase()] } }
          ]
        }
      ]
    }).limit(10);

    // If no providers found, try to create one using AI matching
    if (providers.length === 0) {
      try {
        const aiSuggestion = await generateAIInsuranceMatch(query as string, state as string);
        
        if (aiSuggestion) {
          // Check if this provider already exists with a different name
          const existingProvider = await InsuranceProvider.findOne({
            name: { $regex: aiSuggestion.name, $options: 'i' }
          });

          if (!existingProvider) {
            // Create new provider based on AI suggestion
            const newProvider = await InsuranceProvider.create({
              ...aiSuggestion,
              addedBy: 'ai',
              searchKeywords: [
                ...aiSuggestion.searchKeywords,
                (query as string).toLowerCase()
              ]
            });
            providers = [newProvider];
          } else {
            // Update existing provider with new search keyword
            if (!existingProvider.searchKeywords.includes((query as string).toLowerCase())) {
              existingProvider.searchKeywords.push((query as string).toLowerCase());
              await existingProvider.save();
            }
            providers = [existingProvider];
          }
        }
      } catch (aiError) {
        console.error('AI insurance matching failed:', aiError);
      }
    }

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all insurance providers
// @route   GET /api/insurance/all
// @access  Public
export const getAllInsuranceProviders = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { type = 'health', state, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isActive: true, type };
    if (state) {
      filter.states = state;
    }

    const providers = await InsuranceProvider.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InsuranceProvider.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single insurance provider
// @route   GET /api/insurance/:id
// @access  Public
export const getInsuranceProvider = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const provider = await InsuranceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Insurance provider not found'
      });
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create insurance provider
// @route   POST /api/insurance
// @access  Private
export const createInsuranceProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const providerData = {
      ...req.body,
      addedBy: 'user'
    };

    const provider = await InsuranceProvider.create(providerData);

    res.status(201).json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update insurance provider
// @route   PUT /api/insurance/:id
// @access  Private
export const updateInsuranceProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const provider = await InsuranceProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Insurance provider not found'
      });
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};