import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

/**
 * GET /api/v1/users/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.userId);

  sendSuccess(res, {
    message: 'User retrieved successfully',
    data: { user },
  });
});

/**
 * PUT /api/v1/users/me
 */
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { fullName, profileImage } = req.body;

  const updatedUser = await authService.updateUserProfile(req.userId, {
    fullName,
    profileImage,
  });

  sendSuccess(res, {
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

export default {
  getCurrentUser,
  updateCurrentUser,
};

