import DeactivatedMatch from '../../models/matchSettingsModel.js';

//Toggle Match Status (Deactivate/Activate)
export const toggleMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { sport, matchName } = req.body;

    //Validation checks
    if (!matchId || !sport || !matchName) {
      return res.status(400).json({ message: 'All field are required' });
    }
    if (
      sport != 'cricket' &&
      sport != 'tennis' &&
      sport != 'soccer' &&
      sport != 'horse-racing'
    ) {
      return res.status(400).json({ message: 'Invalid sport' });
    }

    //Check if superamdin
    if (req.role != 'supperadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change match status',
      });
    }

    //Check if match is already deactivated

    const existing = await DeactivatedMatch.findOne({ matchId });

    if (existing) {
      //Match is already deactivated,so we need to activate it
      await DeactivatedMatch.deleteOne({ matchId });
      return res.status(200).json({
        success: true,
        message: 'Match activated successfully',
        data: {
          matchId,
          isActive: true,
        },
      });
    } else {
      //Match is active->Deactivate it
      await DeactivatedMatch.create({ matchId, sport, matchName });
      return res.status(200).json({
        success: true,
        message: 'Match deactivated successfully',
        data: {
          matchId,
          isActive: false,
        },
      });
    }
  } catch (error) {
    console.error('Error in toggleMatchStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
//Get all deactivated matches
export const getDeactivatedMatches = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const deactivatedMatches = await DeactivatedMatch.find()
      .skip(skip)
      .limit(limitNum);
    return res.status(200).json({
      success: true,
      message: 'Deactivated matches fetched successfully',
      data: {
        matches: deactivatedMatches,
      },
    });
  } catch (error) {
    console.error('Error in getDeactivatedMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//Check if a specific match is active
export const checkMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const deactivatedMatch = await DeactivatedMatch.findOne({ matchId });
    if (deactivatedMatch) {
      return res.status(200).json({
        success: true,
        message: 'Match is deactivated',
        data: {
          isActive: false,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        matchId,
        isActive: !deactivatedMatch,
      },
    });
  } catch (error) {
    console.error('Error in checkMatchStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
