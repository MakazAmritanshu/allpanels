import betHistoryModel from '../../models/betHistoryModel.js';
import betModel from '../../models/betModel.js';
import SubAdmin from '../../models/subAdminModel.js'; // Ensure SubAdmin model is imported
import {
  getDateRangeUTC,
  getDateRangeUTCWithOr,
} from '../../utils/dateUtils.js';

export const getMyReportByEvents1 = async (req, res) => {
  const { id } = req;
  const {
    startDate,
    endDate,
    page = 1,
    limit = 10,
    eventName,
    gameName,
    marketName,
  } = req.query;
  // const { eventName, gameName, marketName } = req.body

  try {
    // 1. Retrieve the admin
    const admin = await SubAdmin.findById(id);
    if (!admin) throw new Error('Admin not found');

    // 2. Get all downline users using aggregation
    const downlineUsers = await SubAdmin.aggregate([
      { $match: { _id: admin._id } },
      {
        $graphLookup: {
          from: 'subadmins',
          startWith: '$code',
          connectFromField: 'code',
          connectToField: 'invite',
          as: 'downline',
          depthField: 'level',
          restrictSearchWithMatch: { status: { $ne: 'delete' } },
        },
      },
    ]);

    const downlineIds =
      downlineUsers[0]?.downline.map((user) => user._id) || [];

    // 3. Build the bet query with filters
    const betQuery = {
      userId: { $in: downlineIds },
      status: { $in: [1, 2] }, // 1=win, 2=loss
    };

    // Apply date filters if provided
    // if (startDate || endDate) {
    //     betQuery.date = {};
    //     if (startDate) {
    //         betQuery.date.$gte = new Date(startDate);
    //     }
    //     if (endDate) {
    //         betQuery.date.$lte = new Date(endDate);
    //     }
    // }

    if (startDate && endDate) {
      betQuery.date = getDateRangeUTC(startDate, endDate);
    }

    // Apply gameName filter if provided
    if (gameName) {
      betQuery.gameName = gameName;
    }

    // Apply eventName filter if provided
    if (eventName) {
      betQuery.eventName = eventName;
    }
    if (marketName) {
      betQuery.marketName = marketName;
    }

    // 4. Retrieve bets with pagination
    const bets = await betModel
      .find(betQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 5. Determine grouping key based on provided filters
    let groupKey = 'gameName';
    if (gameName && !eventName && !marketName) {
      groupKey = 'eventName';
    } else if (gameName && eventName && !marketName) {
      groupKey = 'marketName';
    } else if (gameName && eventName && marketName) {
      groupKey = 'marketName';
    }

    // 6. Group and calculate amounts
    const reportMap = {};

    for (const bet of bets) {
      const key = bet[groupKey]?.trim() || 'Unknown';
      if (!reportMap[key]) {
        reportMap[key] = {
          eventName,
          gameName,
          marketName,
          name: key,
          downlineWinAmount: 0,
          downlineLossAmount: 0,
          myProfit: 0,
        };
      }

      const plChange = bet.profitLossChange || 0;
      if (plChange > 0) {
        reportMap[key].downlineWinAmount += plChange;
      } else if (plChange < 0) {
        reportMap[key].downlineLossAmount += Math.abs(plChange);
      }

      reportMap[key].myProfit =
        reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
    }

    const reportArray = Object.values(reportMap);

    // 7. Calculate totals
    const total = reportArray.reduce(
      (acc, curr) => ({
        name: 'Total',
        downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
        downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
        myProfit: acc.myProfit + curr.myProfit,
      }),
      {
        name: 'Total',
        downlineWinAmount: 0,
        downlineLossAmount: 0,
        myProfit: 0,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        report: reportArray,
        total,
      },
    });
  } catch (error) {
    console.error('getMyReportByEvents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//Count the number of uplines

export const getMyReportByEvents = async (req, res) => {
  const { id } = req;
  const {
    startDate,
    endDate,
    page = 1,
    limit = 10,
    eventName,
    gameName,
    marketName,
    userName,
  } = req.query;

  // Convert to numbers for pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  try {
    // 1. Retrieve the admin
    const admin = await SubAdmin.findById(id);
    if (!admin) throw new Error('Admin not found');

    if (admin.secret === 0) {
      return res.status(200).json({ message: 'created successfully' });
    }

    // 2. Get all downline users using aggregation
    const downlineUsers = await SubAdmin.aggregate([
      { $match: { _id: admin._id } },
      {
        $graphLookup: {
          from: 'subadmins',
          startWith: '$code',
          connectFromField: 'code',
          connectToField: 'invite',
          as: 'downline',
          depthField: 'level',
          restrictSearchWithMatch: { status: { $ne: 'delete' } },
        },
      },
    ]);

    const downlineIds =
      downlineUsers[0]?.downline.map((user) => user._id) || [];
    downlineIds.push(admin._id); // ✅ Include admin's own bets

    // Convert to strings for betHistoryModel (userId stored as String)
    const downlineIdStrings = downlineIds.map((id) => id.toString());

    // 3. Trim all filter values for consistent handling
    //  Fix: Explicitly convert to boolean and check for empty strings (with trim)
    const trimmedGameName = gameName ? gameName.trim() : '';
    const trimmedEventName = eventName ? eventName.trim() : '';
    const trimmedMarketName = marketName ? marketName.trim() : '';
    const trimmedUserName = userName ? userName.trim() : '';

    // 4. Build the bet query with filters
    // Use betHistoryModel as single source of truth for P/L reporting
    const betQuery = {
      userId: { $in: downlineIdStrings },
      status: { $in: [1, 2] },
    };

    // Date filters
    if (startDate && endDate) {
      betQuery.date = getDateRangeUTC(startDate, endDate);
    }

    // Apply filters if provided (use trimmed values)
    if (trimmedGameName) {
      betQuery.gameName = trimmedGameName;
    }
    if (trimmedEventName) {
      betQuery.eventName = trimmedEventName;
    }
    if (trimmedMarketName) {
      // For Casino: marketName is actually the marketId (round number), filter by market_id ending with this number
      if (trimmedGameName === 'Casino') {
        betQuery.market_id = { $regex: trimmedMarketName + '$', $options: 'i' }; // Exact match at end
      } else {
        betQuery.marketName = trimmedMarketName;
      }
    }
    if (trimmedUserName) {
      betQuery.userName = trimmedUserName; // Filter by userName string
    }

    // 5. Check if all filters are present (for Casino, return raw data when round is selected)

    const fullFilterMode = !!(
      trimmedGameName &&
      trimmedEventName &&
      trimmedMarketName &&
      trimmedUserName
    );
    const casinoRoundMode =
      trimmedGameName === 'Casino' &&
      trimmedEventName &&
      trimmedMarketName &&
      !trimmedUserName;

    // 6. Detect betHistory mode - when userName is provided, use betHistoryModel
    // betHistoryMode: only userName provided (no game/event/market filters)
    const betHistoryMode = !!(
      trimmedUserName &&
      !trimmedGameName &&
      !trimmedEventName &&
      !trimmedMarketName
    );
    // betHistoryIndividualMode: userName + all filters provided (for individual bets)
    const betHistoryIndividualMode = !!(
      trimmedUserName &&
      trimmedGameName &&
      trimmedEventName &&
      trimmedMarketName
    );

    // 7. Retrieve bets - Use betHistoryModel when userName is provided
    let bets;
    if (betHistoryMode || betHistoryIndividualMode) {
      //  Use betHistoryModel for bet history (individual bet records)
      const targetUser = await SubAdmin.findOne({ userName: trimmedUserName });

      if (targetUser) {
        // Query by BOTH userId and userName to handle different storage formats
        const betHistoryQuery = {
          $or: [
            { userId: targetUser._id.toString() },
            { userId: targetUser._id },
            { userName: trimmedUserName },
          ],
          status: { $in: [1, 2] }, // Exclude pending bets
        };

        //  Filter by gameName if provided (use trimmed value)
        if (trimmedGameName) {
          betHistoryQuery.gameName = trimmedGameName;
        }

        //  Filter by market_id (for Casino) or marketName (for Sports)
        // NOTE: For Casino, we prioritize market_id/roundId matching over eventName
        if (trimmedMarketName) {
          if (trimmedGameName === 'Casino') {
            // For Casino: First find bet by market_id (round number) WITHOUT eventName filter
            // Because eventName in Casino might be stored as the game type (teen20b, poker, etc.)
            const casinoLookupQuery = {
              userId: targetUser._id.toString(),
              gameName: 'Casino',
              status: { $in: [1, 2] },
              market_id: { $regex: trimmedMarketName + '$', $options: 'i' },
            };

            // Add date filter to lookup query
            if (startDate && endDate) {
              casinoLookupQuery.$or = getDateRangeUTCWithOr(startDate, endDate);
            }

            // Find one bet to get the roundId
            const sampleBet = await betHistoryModel
              .findOne(casinoLookupQuery)
              .lean();

            if (sampleBet && sampleBet.roundId) {
              //  Use roundId to get ALL bets for this round
              betHistoryQuery.roundId = sampleBet.roundId;
            } else if (sampleBet) {
              // Has sample bet but no roundId - use market_id regex
              betHistoryQuery.market_id = {
                $regex: trimmedMarketName + '$',
                $options: 'i',
              };
            } else {
              // No sample bet found - still try market_id regex
              betHistoryQuery.market_id = {
                $regex: trimmedMarketName + '$',
                $options: 'i',
              };
            }
          } else {
            // For Sports: Use both eventName and marketName filters
            if (trimmedEventName) {
              betHistoryQuery.eventName = trimmedEventName;
            }
            betHistoryQuery.marketName = trimmedMarketName;
          }
        } else {
          // No marketName filter - apply eventName for non-Casino games
          if (trimmedEventName && trimmedGameName !== 'Casino') {
            betHistoryQuery.eventName = trimmedEventName;
          }
        }

        // Date filters (for non-Casino or when not already added via casinoLookupQuery)
        if (startDate && endDate && !betHistoryQuery.$or) {
          betHistoryQuery.$or = getDateRangeUTCWithOr(startDate, endDate);
        }

        bets = await betHistoryModel
          .find(betHistoryQuery)
          .sort({ createdAt: -1 })
          .lean();
        if (bets.length > 0) {
          console.log(
            '🔍 Sample bets:',
            bets.slice(0, 3).map((b) => ({
              market_id: b.market_id,
              eventName: b.eventName,
              gameName: b.gameName,
              resultAmount: b.resultAmount,
              status: b.status,
            }))
          );
        } else {
          // Debug: Try to find ANY bet for this user to understand what's in DB
          const debugBets = await betHistoryModel
            .find({
              userId: targetUser._id.toString(),
              status: { $in: [1, 2] },
            })
            .limit(5)
            .lean();
          console.log(
            '🔍 [DEBUG] Sample bets for user (without filters):',
            debugBets.map((b) => ({
              market_id: b.market_id,
              eventName: b.eventName,
              gameName: b.gameName,
              marketName: b.marketName,
              date: b.date,
            }))
          );
        }
      } else {
        bets = [];
        console.warn(`⚠️ User not found: ${trimmedUserName}`);
      }
    } else {
      // Use betHistoryModel as single source of truth for P/L reporting
      // betHistoryModel stores each individual bet with original values,
      // unlike betModel which may have zeroed-out offset positions
      bets = await betHistoryModel
        .find(betQuery)
        .sort({ createdAt: -1 })
        .lean();
    }

    //Also we have to find the latest Result and market Id of the bets we can find it by us only we have to fetch the latest betHistory record then there we can fetch market Id and result

    // 8. Handle full filter mode OR Casino round mode OR betHistoryIndividualMode (return raw data with pagination)
    if (fullFilterMode || casinoRoundMode || betHistoryIndividualMode) {
      const totalBets = bets.length;
      const skip = (pageNum - 1) * limitNum;
      const paginatedBets = bets.slice(skip, skip + limitNum);

      // Map bets to include all fields from betHistoryModel
      const mappedBets = paginatedBets.map((bet) => ({
        ...bet, // Include ALL fields from betHistoryModel
        result: bet.betResult || null,
        marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
        myProfit: bet.profitLossChange || 0,
      }));

      return res.status(200).json({
        success: true,
        data: {
          report: mappedBets,
          total: {
            totalBets: totalBets,
            totalWinAmount: bets.reduce(
              (sum, b) => sum + Math.max(b.profitLossChange || 0, 0),
              0
            ),
            totalLossAmount: bets.reduce(
              (sum, b) => sum + Math.abs(Math.min(b.profitLossChange || 0, 0)),
              0
            ),
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalBets,
            totalPages: Math.ceil(totalBets / limitNum),
          },
        },
      });
    }

    //  Handle betHistory mode - group by market_id (Casino) or eventName (Sports)
    if (betHistoryMode && !betHistoryIndividualMode) {
      const reportMap = {};

      for (const bet of bets) {
        let key;

        // Group by market_id for Casino, eventName for Sports
        if (bet.gameName === 'Casino') {
          // For Casino: group by market_id (round number)
          key = bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : 'Unknown';
        } else {
          // For Sports: group by eventName
          key = bet.eventName?.trim() || 'Unknown';
        }

        if (!reportMap[key]) {
          reportMap[key] = {
            name: key,
            eventName: bet.eventName,
            gameName: bet.gameName,
            marketName: bet.marketName,
            userName: bet.userName,
            date: bet.date || bet.createdAt,
            result: bet.betResult,
            marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
            downlineWinAmount: 0,
            downlineLossAmount: 0,
            myProfit: 0,
            totalBets: 0,
          };
        }

        reportMap[key].totalBets += 1;

        const plChange = bet.profitLossChange || 0;
        if (plChange > 0) {
          reportMap[key].downlineWinAmount += plChange;
        } else if (plChange < 0) {
          reportMap[key].downlineLossAmount += Math.abs(plChange);
        }

        reportMap[key].myProfit =
          reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
      }

      const reportArray = Object.values(reportMap);
      console.log('🔍 [BETHISTORY] After grouping:');
      console.log('🔍 [BETHISTORY] Grouped reports count:', reportArray.length);

      const totalReports = reportArray.length;
      const skip = (pageNum - 1) * limitNum;
      const paginatedReport = reportArray.slice(skip, skip + limitNum);

      const total = reportArray.reduce(
        (acc, curr) => ({
          name: 'Total',
          downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
          downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
          myProfit: acc.myProfit + curr.myProfit,
          totalBets: acc.totalBets + curr.totalBets,
        }),
        {
          name: 'Total',
          downlineWinAmount: 0,
          downlineLossAmount: 0,
          myProfit: 0,
          totalBets: 0,
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          report: paginatedReport,
          total,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalReports,
          totalPages: Math.ceil(totalReports / limitNum),
        },
      });
    }

    // 9. Existing grouping logic for partial filters
    let groupKey = 'gameName';
    let isCasinoMarketLevel = false; // Flag for Casino special handling

    //  Fix: Use trimmed values for consistency
    const hasGameName = !!trimmedGameName;
    const hasEventName = !!trimmedEventName;
    const hasMarketName = !!trimmedMarketName;
    const hasUserName = !!trimmedUserName;

    if (hasGameName && !hasEventName && !hasMarketName && !hasUserName) {
      groupKey = 'eventName';
    } else if (hasGameName && hasEventName && !hasMarketName && !hasUserName) {
      // For Casino: group by market_id (rounds) instead of marketName (always "WINNER")
      if (trimmedGameName === 'Casino') {
        isCasinoMarketLevel = true;
        groupKey = 'market_id'; // Group by market_id to show individual rounds
      } else {
        groupKey = 'marketName';
      }
    } else if (hasGameName && hasEventName && hasMarketName && !hasUserName) {
      groupKey = 'userName';
    }

    const reportMap = {};

    for (const bet of bets) {
      // For Casino market level, use the numeric marketId as key
      let key;
      if (isCasinoMarketLevel) {
        key = bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : 'Unknown';
      } else {
        key = bet[groupKey]?.trim() || 'Unknown';
      }

      if (!reportMap[key]) {
        reportMap[key] = {
          name: key,
          eventName: bet.eventName,
          gameName: bet.gameName,
          marketName: bet.marketName,
          userName: bet.userName,
          date: bet.createdAt,
          result: bet.betResult,
          marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
          downlineWinAmount: 0,
          downlineLossAmount: 0,
          myProfit: 0,
        };
      }

      const plChange = bet.profitLossChange || 0;
      if (plChange > 0) {
        reportMap[key].downlineWinAmount += plChange;
      } else if (plChange < 0) {
        reportMap[key].downlineLossAmount += Math.abs(plChange);
      }

      reportMap[key].myProfit =
        reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
    }

    const reportArray = Object.values(reportMap);

    //  Apply pagination AFTER aggregation
    const totalReports = reportArray.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedReport = reportArray.slice(skip, skip + limitNum);
    console.log(
      'skip:',
      skip,
      'paginatedReport length:',
      paginatedReport.length
    );

    const total = reportArray.reduce(
      (acc, curr) => ({
        name: 'Total',
        downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
        downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
        myProfit: acc.myProfit + curr.myProfit,
      }),
      {
        name: 'Total',
        downlineWinAmount: 0,
        downlineLossAmount: 0,
        myProfit: 0,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        report: paginatedReport, //  Return paginated results
        total,
      },
    });
  } catch (error) {
    console.error('getMyReportByEvents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGraphBackupData = async (req, res) => {
  const { id } = req;
  const { startDate, endDate } = req.query;

  try {
    // 1. Retrieve the admin
    const admin = await SubAdmin.findById(id);
    if (!admin) throw new Error('Admin not found');

    if (admin.secret === 0) {
      return res.status(200).json({ message: 'created successfully' });
    }

    // 2. Get all downline users using aggregation
    const downlineUsers = await SubAdmin.aggregate([
      { $match: { _id: admin._id } },
      {
        $graphLookup: {
          from: 'subadmins',
          startWith: '$code',
          connectFromField: 'code',
          connectToField: 'invite',
          as: 'downline',
          depthField: 'level',
          restrictSearchWithMatch: { status: { $ne: 'delete' } },
        },
      },
    ]);

    const downlineIds =
      downlineUsers[0]?.downline.map((user) => user._id.toString()) || [];

    // 3. Build the bet query with filters
    const betQuery = {
      userId: { $in: downlineIds },
      status: { $in: [1, 2] },
    };

    // Date filters
    if (startDate && endDate) {
      betQuery.date = getDateRangeUTC(startDate, endDate);
    }

    // Apply filters if provided
    // if (gameName) betQuery.gameName = gameName;
    // if (eventName) betQuery.eventName = eventName;
    // if (marketName) betQuery.marketName = marketName;
    // if (userName) betQuery.userName = userName;

    // 4. Check if all three filters are present
    // const fullFilterMode = gameName && eventName && marketName && userName;

    // 5. Retrieve bets with pagination
    const bets = await betHistoryModel.find(betQuery);
    // console.log("bets", bets)

    // 7. Existing grouping logic for partial filters
    let groupKey = 'gameName';

    const reportMap = {};

    for (const bet of bets) {
      const key = bet[groupKey]?.trim() || 'Unknown';
      if (!reportMap[key]) {
        reportMap[key] = {
          name: key,
          downlineWinAmount: 0,
          downlineLossAmount: 0,
          myProfit: 0,
        };
      }

      const plChange = bet.profitLossChange || 0;
      if (plChange > 0) {
        reportMap[key].downlineWinAmount += plChange;
      } else if (plChange < 0) {
        reportMap[key].downlineLossAmount += Math.abs(plChange);
      }
      reportMap[key].myProfit =
        reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
    }

    const reportArray = Object.values(reportMap);
    const total = reportArray.reduce(
      (acc, curr) => ({
        name: 'Total',
        downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
        downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
        myProfit: acc.myProfit + curr.myProfit,
      }),
      {
        name: 'Total',
        downlineWinAmount: 0,
        downlineLossAmount: 0,
        myProfit: 0,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        report: reportArray,
        total,
      },
    });
  } catch (error) {
    console.error('getMyReportByEvents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getGraphLiveData = async (req, res) => {
  const { id } = req;
  const { startDate, endDate } = req.query;

  // console.log("req.query", req.query);

  try {
    // 1. Retrieve the admin
    const admin = await SubAdmin.findById(id);
    if (!admin) throw new Error('Admin not found');

    if (admin.secret === 0) {
      return res.status(200).json({ message: 'created successfully' });
    }

    // 2. Get all downline users using aggregation
    const downlineUsers = await SubAdmin.aggregate([
      { $match: { _id: admin._id } },
      {
        $graphLookup: {
          from: 'subadmins',
          startWith: '$code',
          connectFromField: 'code',
          connectToField: 'invite',
          as: 'downline',
          depthField: 'level',
          restrictSearchWithMatch: { status: { $ne: 'delete' } },
        },
      },
    ]);

    const downlineIds =
      downlineUsers[0]?.downline.map((user) => user._id.toString()) || [];

    // 3. Build the bet query with filters
    const betQuery = {
      userId: { $in: downlineIds },
      status: { $in: [1, 2] },
    };

    // Date filters
    if (startDate || endDate) {
      betQuery.date = {};
      if (startDate) betQuery.date.$gte = new Date(startDate);
      if (endDate) betQuery.date.$lte = new Date(endDate);
    }

    // Apply filters if provided
    // if (gameName) betQuery.gameName = gameName;
    // if (eventName) betQuery.eventName = eventName;
    // if (marketName) betQuery.marketName = marketName;
    // if (userName) betQuery.userName = userName;

    // 4. Check if all three filters are present
    // const fullFilterMode = gameName && eventName && marketName && userName;

    // 5. Retrieve bets with pagination
    const bets = await betHistoryModel.find(betQuery);
    // console.log("bets", bets)

    // 7. Existing grouping logic for partial filters
    let groupKey = 'gameName';

    const reportMap = {};

    for (const bet of bets) {
      const key = bet[groupKey]?.trim() || 'Unknown';
      if (!reportMap[key]) {
        reportMap[key] = {
          name: key,
          downlineWinAmount: 0,
          downlineLossAmount: 0,
          myProfit: 0,
        };
      }

      const plChange = bet.profitLossChange || 0;
      if (plChange > 0) {
        reportMap[key].downlineWinAmount += plChange;
      } else if (plChange < 0) {
        reportMap[key].downlineLossAmount += Math.abs(plChange);
      }
      reportMap[key].myProfit =
        reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
    }

    const reportArray = Object.values(reportMap);
    const total = reportArray.reduce(
      (acc, curr) => ({
        name: 'Total',
        downlineWinAmount: acc.downlineWinAmount + curr.downlineWinAmount,
        downlineLossAmount: acc.downlineLossAmount + curr.downlineLossAmount,
        myProfit: acc.myProfit + curr.myProfit,
      }),
      {
        name: 'Total',
        downlineWinAmount: 0,
        downlineLossAmount: 0,
        myProfit: 0,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        report: reportArray,
        total,
      },
    });
  } catch (error) {
    console.error('getMyReportByEvents error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReportByDownline = async (req, res) => {
  const { id } = req;
  const {
    startDate,
    endDate,
    page = 1,
    limit = 10,
    targetUserId,
    eventName,
    gameName,
    marketName,
    userName,
  } = req.query;

  try {
    // 1. Validate and parse inputs
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // let findId = 0

    const findId = targetUserId || id;

    // 2. Retrieve admin and downline structure
    const admin = await SubAdmin.findById(findId);
    if (!admin) throw new Error('Admin not found');

    if (admin.secret === 0) {
      return res.status(200).json({ message: 'created successfully' });
    }

    let downlineResult = [];
    let downlineIds = [];
    let allRecursiveDownlines = []; // Store all recursive downlines for admin P&L aggregation

    if (admin.role === 'user') {
      // 👤 If the admin is a regular user, include only their own ID
      downlineResult = [admin]; // make it an array for consistent use later
      downlineIds = [admin._id.toString()];
    } else {
      // 🧑‍💼 If admin is not a user, get all downline users
      // Query 1: Get DIRECT downlines for report display
      downlineResult = await SubAdmin.find({
        invite: admin.code,
        status: { $ne: 'delete' },
      });

      // Query 2: Get ALL RECURSIVE downlines for bet aggregation (includes nested downlines)
      const graphLookupResult = await SubAdmin.aggregate([
        { $match: { _id: admin._id } },
        {
          $graphLookup: {
            from: 'subadmins',
            startWith: '$code',
            connectFromField: 'code',
            connectToField: 'invite',
            as: 'allDownlines',
            depthField: 'depth',
            restrictSearchWithMatch: { status: { $ne: 'delete' } },
          },
        },
      ]);

      allRecursiveDownlines = graphLookupResult[0]?.allDownlines || [];
      downlineIds = allRecursiveDownlines.map((user) => user._id.toString());
    }

    // console.log("downlineIds", downlineResult);

    // const downlineIds = downlineResult.map(user => user._id.toString());

    // 3. Build base query
    const betQuery = {
      userId: { $in: downlineIds },
      status: { $in: [1, 2] },
    };

    if (startDate && endDate) {
      betQuery.date = getDateRangeUTC(startDate, endDate);
    }

    // Additional filters
    // if (userName) betQuery.userId = userName;
    if (userName) betQuery.userName = userName;
    if (gameName) betQuery.gameName = gameName;
    if (eventName) betQuery.eventName = eventName;
    if (marketName) {
      if (gameName === 'Casino') {
        betQuery.market_id = marketName;
      } else {
        betQuery.marketName = marketName;
      }
    }

    // 4. Get downline profit/loss (all matching bets)
    const userProfitAggregation = await betHistoryModel.aggregate([
      { $match: betQuery },
      {
        $group: {
          _id: '$userId',
          totalWin: {
            $sum: {
              $cond: [
                { $gt: ['$profitLossChange', 0] },
                '$profitLossChange',
                0,
              ],
            },
          },
          totalLoss: {
            $sum: {
              $cond: [
                { $lt: ['$profitLossChange', 0] },
                { $abs: '$profitLossChange' },
                0,
              ],
            },
          },
        },
      },
    ]);

    // console.log("userProfitAggregation", userProfitAggregation)

    // Create map for quick lookup
    const profitMap = new Map();
    userProfitAggregation.forEach((entry) => {
      profitMap.set(entry._id.toString(), {
        totalWin: entry.totalWin,
        totalLoss: entry.totalLoss,
        netProfit: entry.totalWin - entry.totalLoss,
      });
    });

    // 5. Create downline profit report
    // const downlineProfitReport = downlineResult.map(user => ({
    //     userId: user._id,
    //     role: user.role,
    //     userName: user.userName,
    //     ...(profitMap.get(user._id.toString()) || {
    //         totalWin: 0,
    //         totalLoss: 0,
    //         netProfit: 0
    //     })
    // }));
    // 5. Create downline profit report
    const downlineProfitReport = downlineResult.map((user) => {
      let directPL = profitMap.get(user._id.toString()) || {
        totalWin: 0,
        totalLoss: 0,
        netProfit: 0,
      };

      //  If user is an admin, aggregate ALL recursive downlines' P&L
      if (user.role !== 'user') {
        let adminTotalWin = 0;
        let adminTotalLoss = 0;
        let foundDownlines = 0;

        // Get ALL recursive descendant IDs for this admin (not just direct children)
        const getAllDescendantIds = (adminCode) => {
          const descendantIds = new Set();
          const codesToProcess = [adminCode];

          while (codesToProcess.length > 0) {
            const currentCode = codesToProcess.pop();
            allRecursiveDownlines.forEach((downline) => {
              if (downline.invite === currentCode) {
                descendantIds.add(downline._id.toString());
                // If this downline has a code (is an admin), process their children too
                if (downline.code && downline.role !== 'user') {
                  codesToProcess.push(downline.code);
                }
              }
            });
          }

          return descendantIds;
        };

        // Get ALL recursive descendants and sum their P/L
        const allDescendantIds = getAllDescendantIds(user.code);

        allDescendantIds.forEach((descendantId) => {
          foundDownlines++;
          const downlinePL = profitMap.get(descendantId);
          if (downlinePL) {
            adminTotalWin += downlinePL.totalWin;
            adminTotalLoss += downlinePL.totalLoss;
          }
        });

        // Only use aggregation if downlines were found
        if (foundDownlines > 0) {
          directPL = {
            totalWin: adminTotalWin,
            totalLoss: adminTotalLoss,
            netProfit: adminTotalWin - adminTotalLoss,
          };
        }
      }

      return {
        userId: user._id,
        role: user.role,
        userName: user.userName,
        totalWin: directPL.totalWin,
        totalLoss: directPL.totalLoss,
        netProfit: directPL.netProfit, // ✅ FIXED: Use filtered calculation (directPL.netProfit) instead of hierarchical
        directBettingPL: directPL.netProfit, // Keep direct P/L for reference
        hierarchicalPL: user.bettingProfitLoss || 0, // Show hierarchical P/L (all-time, for reference)
        bettingProfitLoss: user.bettingProfitLoss || 0, // User's own betting P/L
        creditReferenceProfitLoss: user.creditReferenceProfitLoss || 0, // User's credit ref P/L
        uplineProfitLoss: user.uplineBettingProfitLoss || 0, // Admin's upline P/L (if admin)
      };
    });

    // 6. Get ALL bets for aggregation (no pagination yet)
    const bets = await betHistoryModel
      .find(betQuery)
      .sort({ createdAt: -1 })
      .lean();

    // 7. Handle different report types
    const fullFilterMode = [gameName, eventName, marketName, userName].every(
      Boolean
    );
    let reportData = {};

    //  FIXED: Define totalCount before using it
    const totalCount = bets.length;
    const paginatedBets = bets.slice(skip, skip + limitNum);

    if (fullFilterMode) {
      // Raw bet data
      reportData = {
        reportType: 'raw',
        bets: paginatedBets, // ✅ FIXED: Use paginated bets instead of all bets
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      };
    } else {
      // Grouped data

      // 7. Existing grouping logic for partial filters
      // let groupKey = 'userName';
      // if (userName && !gameName && !eventName && !marketName) {
      //   groupKey = 'gameName';
      // } else if (userName && gameName && !eventName && !marketName) {
      //   groupKey = 'eventName';
      // } else if (userName && gameName && eventName && !marketName) {
      //   groupKey = 'marketName';
      // }
      // 7. Existing grouping logic for partial filters
      let groupKey = 'userName';
      let isCasinoMarketLevel = false; // Flag for Casino special handling

      //  FIX: When viewing a single user (targetUserId provided and admin is user), group by gameName
      if (
        targetUserId &&
        admin.role === 'user' &&
        !gameName &&
        !eventName &&
        !marketName
      ) {
        // Single user view - show their games
        groupKey = 'gameName';
        console.log(
          ' BACKEND - Grouping: Single user view, grouping by gameName'
        );
      } else if (userName && !gameName && !eventName && !marketName) {
        // Filtered by userName - show games
        groupKey = 'gameName';
        console.log(
          ' BACKEND - Grouping: Filtered by userName, grouping by gameName'
        );
      } else if (
        (userName || (targetUserId && admin.role === 'user')) &&
        gameName &&
        !eventName &&
        !marketName
      ) {
        // Filtered by userName/targetUserId + gameName - show events
        groupKey = 'eventName';
        console.log(
          '🔍 BACKEND - Grouping: Filtered by targetUserId + gameName, grouping by eventName'
        );
      } else if (
        (userName || (targetUserId && admin.role === 'user')) &&
        gameName &&
        eventName &&
        !marketName
      ) {
        // Filtered by userName/targetUserId + gameName + eventName - show markets
        // For Casino: group by market_id (rounds) instead of marketName (always "WINNER")
        if (gameName === 'Casino') {
          isCasinoMarketLevel = true;
          groupKey = 'market_id'; // Group by market_id to show individual rounds
          console.log(
            ' BACKEND - Grouping: Casino market level, grouping by market_id'
          );
        } else {
          groupKey = 'marketName';
          console.log(
            ' BACKEND - Grouping: Filtered by targetUserId + gameName + eventName, grouping by marketName'
          );
        }
      } else {
        console.log(' BACKEND - Grouping: Default grouping by userName');
      }

      // console.log("bets", bets)

      const reportMap = {};
      for (const bet of bets) {
        // For Casino market level, use the numeric marketId as key
        let key;
        if (isCasinoMarketLevel) {
          key = bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : 'Unknown';
        } else {
          key = bet[groupKey]?.trim() || 'Unknown';
        }

        // console.log("Group Key:", groupKey, "Key Value:", key);
        if (!reportMap[key]) {
          reportMap[key] = {
            name: key,
            eventName: bet.eventName,
            gameName: bet.gameName,
            marketName: bet.marketName,
            userName: bet.userName,
            date: bet.createdAt,
            downlineWinAmount: 0,
            downlineLossAmount: 0,
            myProfit: 0,
            result: bet.betResult,
            marketId: bet.market_id ? bet.market_id.match(/\d+/g)?.pop() : null,
          };
        }

        const plChange = bet.profitLossChange || 0;
        if (plChange > 0) {
          reportMap[key].downlineWinAmount += plChange;
        } else if (plChange < 0) {
          reportMap[key].downlineLossAmount += Math.abs(plChange);
        }
        reportMap[key].myProfit =
          reportMap[key].downlineWinAmount - reportMap[key].downlineLossAmount;
      }

      // console.log("reportMap", reportMap)

      const reportArray = Object.values(reportMap);
      const totalReports = reportArray.length;

      console.log('🔍 BACKEND - After grouping:');
      console.log('  reportArray length:', reportArray.length);
      console.log('  groupKey used:', groupKey);
      if (reportArray.length > 0) {
        console.log(
          '  reportArray sample (first 3):',
          reportArray
            .slice(0, 3)
            .map((r) => ({ name: r.name, gameName: r.gameName }))
        );
      }

      //  Apply pagination AFTER aggregation
      const paginatedReports = reportArray.slice(skip, skip + limitNum);

      reportData = {
        reportType: 'grouped',
        groupBy: groupKey,
        reports: paginatedReports, // ✅ Return paginated results
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalReports, // ✅ Total grouped reports, not individual bets
          totalPages: Math.ceil(totalReports / limitNum),
        },
      };
    }

    // Paginate downlineProfitReport
    const totalDownlineCount = downlineProfitReport.length;
    const paginatedDownlineProfitReport = downlineProfitReport.slice(
      skip,
      skip + limitNum
    );

    return res.status(200).json({
      success: true,

      data: {
        ...reportData,
        downlineProfitReport: paginatedDownlineProfitReport,
        downlinePagination: {
          page: pageNum,
          limit: limitNum,
          total: totalDownlineCount,
          totalPages: Math.ceil(totalDownlineCount / limitNum),
        },
        overallProfit: {
          totalWin: downlineProfitReport.reduce(
            (sum, u) => sum + u.totalWin,
            0
          ),
          totalLoss: downlineProfitReport.reduce(
            (sum, u) => sum + u.totalLoss,
            0
          ),
          netProfit: downlineProfitReport.reduce(
            (sum, u) => sum + u.netProfit,
            0
          ), // ✅ FIXED: Sum filtered netProfit instead of stored bettingProfitLoss
          totalBettingProfitLoss: downlineProfitReport.reduce(
            (sum, u) => sum + u.netProfit,
            0
          ), // ✅ FIXED: Sum filtered netProfit instead of stored bettingProfitLoss
          totalCreditReferenceProfitLoss: downlineProfitReport.reduce(
            (sum, u) => sum + u.creditReferenceProfitLoss,
            0
          ), // For display only
        },
      },
    });
  } catch (error) {
    console.error('Report error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

export const getBetHistory = async (req, res) => {
  //   const { id } = req; // Assuming id comes from auth middleware
  const {
    id,
    page = 1,
    limit = 10,
    startDate,
    endDate,
    selectedGame,
    selectedVoid,
  } = req.query;

  try {
    const query = { userId: id };

    // Filter by date if both start and end dates are provided
    if (startDate && endDate) {
      query.date = getDateRangeUTC(startDate, endDate);
    }

    // Filter by selectedGame if provided
    if (selectedGame) {
      query.gameName = selectedGame;
    }

    // Filter by selectedVoid if provided
    if (selectedVoid === 'settel') {
      query.status = { $ne: 0 }; // Not equal to 0 (settled bets)
    } else if (selectedVoid === 'void') {
      query.status = 3; // Voided bets (status = 3)
    } else if (selectedVoid === 'unsettel') {
      query.status = 0; // Unsettled bets (status = 0)
    }

    const bets = await betHistoryModel
      .find(query)
      .sort({ date: -1 }) // most recent first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await betHistoryModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bet history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
