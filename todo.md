//Task1 - RESOLVED
Upper line down line se agar balance withdraw korta hai to down line ka pl me effect hota hai upper line ka nehi .
The problem is that when i am creating a downline from superadmin to master then agent and then i am creating user under agent and when i am withdrawing or depositing some money from that agent user it is showing its creditReferenceProfitLoss but is updating is parent white creditReferenceProfitAndLoss

FIXED: Removed the 3 lines in withdrowalAndDeposite() that incorrectly recalculated upline's creditReferenceProfitLoss.
Lines removed: 1683-1685, 1793-1795, 1822-1824 in subAdminController.js

//Task2
The problem i am facing is that total exposure is not updated in uplines it was working earlier but now this feature is broken in my production can pls review my latest git review so i have clear understanding what is going behind the scene
FIXED: If downline is NOT a 'user' role (i.e., it's an agent/admin),
use their stored totalExposure which was already calculated recursively.
Only calculate from bets for actual end-users who place bets.

//Task3
I want to navigate login when user visit on home route only login page no navbar sidebar only a simple page when user login it visit to home page (THIS IS NOT A PERMANNET FIX ACCORDING TO DIFFERENT CLIENT WE WILL TAKE DIFFERENT PROCESS)so comment my existing feature so i can use in future
FIXED:I have fixed this issue and added a comment REDO WHEN NEEDED

//TASK4
The problem i am facing is that i have initial balance of 10000
now i placed a bet on player A on back stake 10k and betAmount 9.8k
and then i again placed on bet on Player A lay with stake 10k and odds of 1.67
now my exposure becomes 0 and avialble balance become 10k
and now again on Player A 100 with odds 1.7 now avaibkle balance comes 13030 and exposure is 3030
this is wrong avaibla balance the exposure should be 3030 and the aviablance balance should be 10k-3030 pls review why it is causing this calculation error
FIXED:I have fixed this issue

//Task 5
The problem i am facing is that i have initial balance of 10k and initial avaible balance of 10k
First bet i have placed on back player A stake of 10k with odds(1.98)
technically i player A wins it will get 9.8k profit and if loss 10k loss
and then i placed by second bet on layy with stake 10k and odds of (1.65)
technically if player loss then he will win 6500 and and if player loss it will get 10k
now exposure is coming 0 and avilable balance is 10k and if player A wins (9800-6500)=3300 benefit and if player b wins then he will loss 10k and wins 10k since it will get 0
all is working fine
now the real problem is that if i again place bet on player a on lay of 100 stake with odds 1.37 now the exposure is coming (3300-37)
and the avaible balance is 10k how this is possible
my analysis say that exposure will be 0 in the case
what your analysis say -->pls say
and what code analysis say also refer my previous plan that i have implemented so you will get clear picture what changes have done before
FIXED:I have fixed this issue

//Task 6
The problem i am facing is that you have fixed task 5 but the thing is that if player A wins the balance should be 10100 and tha avbalance should also be 10100 but the avilable balance is coming (10k-3263)" pls take task 5 and pls do analysis of tsak5 and task 6 and write testcases till betSeettlement if player A wins what will be the balance and avilable balance and what will be the balance and what if player B wins then
pls do proper analysis of both task 5 and 6
FIXED:I have fixed this issue

//TASK 7
The problem is that i have fixed 5,6 problem but now i have to fixed from the frontend side in client
in frontend it is showing negative amount when player A wins and not displaying any amount when playerB wins
fix(offset): negative price scenario-guarenteed profit from offset betting (#101)

//Task8
{
"data": [
{
"\_id": "6969c8530a7b18284da36167",
"userId": "6969c6c10a7b18284da352b6",
"gameId": "poison",
"roundId": "174260116103927",
"betId": "6969c84d0a7b18284da360f8",
"cid": 4,
"gid": 35,
"betType": "casino",
"tabno": 6,
"market_id": "casino_poison_1768540237609_9406",
"userName": "avinash1",
"otype": "lay",
"price": 94,
"xValue": 1.94,
"resultAmount": 0,
"betAmount": 100,
"status": 0,
"eventName": "poison",
"marketName": "WINNER",
"fancyScore": "0",
"gameType": "casino",
"gameName": "Casino",
"teamName": "Player A",
"recordType": "individual",
"relatedBets": [],
"date": "2026-01-16T05:10:43.740Z",
"createdAt": "2026-01-16T05:10:43.741Z",
"updatedAt": "2026-01-16T05:10:43.741Z",
"**v": 0
},
{
"\_id": "6969c84e0a7b18284da36108",
"userId": "6969c6c10a7b18284da352b6",
"gameId": "poison",
"roundId": "174260116103927",
"betId": "6969c84d0a7b18284da360f8",
"cid": 4,
"gid": 35,
"betType": "casino",
"tabno": 6,
"market_id": "casino_poison_1768540237609_9406",
"userName": "avinash1",
"otype": "back",
"price": 100,
"xValue": 1.86,
"resultAmount": 0,
"betAmount": 86,
"status": 0,
"eventName": "poison",
"marketName": "WINNER",
"fancyScore": "0",
"gameType": "casino",
"gameName": "Casino",
"teamName": "Player A",
"recordType": "individual",
"relatedBets": [],
"date": "2026-01-16T05:10:38.125Z",
"createdAt": "2026-01-16T05:10:38.126Z",
"updatedAt": "2026-01-16T05:10:38.126Z",
"**v": 0
}
]
}
the problem is here exposure is 8 but why it is showing player A wins it is showing green in player 8 and not 0 in playerB

//TASK 8
The problem i am facing is that i want to include one new feature in our codebase suppose i bet on sports match i have no result due to any conditions(such as rain or something) then the users will get their amount back and status will set to 3 with void type i hope you get my point anaylze my codebase and dive deep into this i want exact feature with no problems
STATUS:FIXED FROM FRONTEND

//TASK9
The problem i am facing is that i want to include one feature in which if the result get tie in sports or fancy the user placed a bet on team A suppose that but if the match has been tie then the user will be get lost and settled with status 2 so dive deep in my codebase and fixed this issue accordingly and also add a tie option in manualResult in superadmin

//TASK10
I want to ensure consistency accross my codebase it should ensure that it should follow some princples accross first i am finding the consistency in my admin section
TotalBalance=TotalExposure+AvailableBalance
TotalAvailbal=Balance+TotalBalance
uplineP/L=TotalBettingP/L
my question is the uplineP/L is equal to eventP/L ,downlineP/L
creditReference=baseBalance-balance
ensure consistency i want to do recusrive testing i am conffident enough and it should not break covering all scenario
i have identify the issue here the main issue is the when negative price scenario-guarenteed profit from offset betting
this is happening due to some profit and loss are changing due to inconsistent sometime profitLoss and sometime loss showing profit

//TASK11
The problem i am facing is that when i am using negativePrice scenario-guarenteed profit from offset betting the problem here it is not taking effective balance for placing a bet pls look in my codebase
//My aim is to make it consistent that in any scenario it should calculate effective balance which means suppose i have PTI:10K and playerA win it gets 5100 then i can place a bet of (10k+5100)

//TASK12
The problem i am facing right now is that i have balance and available balance of 10k
first bet ->10k(back) PLAYER A stake 9.8k profit ,-10k loss odds of 1.98
second bet->10k(lay) PLAYER A stake 10k but profits of 10k and loss of 6.7k odds of 1.67
third bet ->100(lay) player A stake of 100 profit 37 and 100 loss odds of 1.37
if player A wins 3100-37=3063
if Player B wins 100 rs profit
now available balance is 10k and exposure is of 0
suppose now i place a bet on Player A back effecrive balance(10k+3063) this means i can place a bet of 13063 but it is showing insuficient balance see other possibilites where it is filing in casino and sports
STATUS:ALMOST FIXED NEED TO VERIFY FROM THE CLIENT

//TASK13
The problem i am facing right now is that when negative sceanrio-guaranteed profit from offset betting
sceanrion
i am giving beet scenario now
A user place bet on PlayerA(BACK)->ODDS(1.98) STAKE(10,000) if player A wins they will gain +9800 and -10000 loss
and suppose i place bet on PLAYERA(LAY)->ODDS(1.88) STAKE(10,000) if player A wins due it place on existing bet then
combining both bets
PLayerA will get +10k
pLAYERB will get 0
Now i am placing another bet on PLAYERA(LAY)->odds(2.14) STAKE(500) if player A wins combining all three bets
PLAYERA will get(430)
PLAYERB will get(500)
This is the case of negative price scenario-guaranteed profit it is showing in client side PlayerA If player A wins (-430) in red color and Player B wins it is showing nothing
Now the problem is that 430 and 500 should be shown in green and also in have tried previously to change it is affecting my other logics what i wanted is that i dont want to disturb my existing logic in client side and i want to handle this for now later if any problem arises we will fix that
FIXED:This problem is fixed

//TASK14
The problem i am facing right now is that i have place 3 bets each bets on Player A
first bet i have placed is on PlayerA odds(1.98) with a stake 10k on back this means that if player A wins it will get +9800 profit and -10k loss
and second bet i have placed on Player A with odds(1.67) stake 10k this is lay bet so if Player B wins here it will get 10k and loss of (6700)
Now i have placed a third bet Player A on back with odds(1.65) with stake of 500 this means if Player A wins it will get +500 and loss of 325

Now this means that
TotalAvailablebalance:10k
Exposure:0

Now if Player A wins it will get +2775
and if Player B wins it will get +500
Now the effective balance is calculated accordingly like this now user can place a on Player B (availablebalance+PlayerA wins)->(10k+2775) because available balance+Player A wins if Player B loss it can afford same with if he will Place a back bet (10k+500) and this will follow in lay case as well this has to be done in casino and sports section
Note:Our main idea is that PTI(Available Balance should never be negative) because if we placed bet on Player A(10k+profitOfTeamPlayer) then it will take PTI available balance in negative and also we have deal with lay bet scenario
FIXED:This problem is fixed in Casino check in sports

//TASK15
The problem i am facing right now is that i have balance of 1k and available balance of 1k suppose i am placing a bet on Player B(lAY) with odds of 1.96 suppose i want to place a bet of 1200 but the available balance is 1000 but here is the catch point if Player A wons 1200 and Player B wins it will loss of 1152 technically the bets can be placed even if the available balance is of 1000 but the profit if A wins it is 1200 so user can place a bet of 1200 according to me
FIXED:Verify this later

//TASK16
The problem i am facing is that i have balance and available balance 1000 with exposure 0
I have place first bet on lay(1.96) stake of 1040 liability if 998.4 if Player A will win it will get 1040 and if Player B it loss 998.4 since liability is less than the available balance so bet can be placed
exposure i 998.4
and available balanve is 1,6
Now i want place secons bet on Player A back (2.14) with 998 balance techincally Player A should win 1040+1137 and Player B will loss 998.4+998 but it is showing insufficient balance bet is not taking place it is showing insufficient balance this means effective balance is not caluclating properly and also test all effective balance cases  
FIXED:CLIENT SATISFIED

//TASK17
The problem i am facing is that i want downlineProfitLoss eventProfitLoss and also uplineProfitLoss should be same but the problem is that downlineProfitLoss,eventProfitLoss are coming same but uplineProfitLoss are not same ..later on i dig into the problem i found that uplineProfitLoss are coming correct but the downlineProfitLoss and eventProfitLoss are corrupted and this is corrupting in few conditions

http://localhost:3000/api/sub-admin/getuserbyid
{
"message": "Sub-admin details retrieved successfully",
"data": {
"\_id": "688758b400082b22d3f78a41",
"name": "user1",
"userName": "user1",
"account": "user",
"code": "8CDAF764",
"commition": "1",
"balance": 100000,
"totalBalance": 5026,
"profitLoss": 0,
"avbalance": 95000,
"agentAvbalance": 5026,
"totalAvbalance": 100026,
"exposure": 0,
"totalExposure": 0,
"exposureLimit": 100000,
"creditReference": 100000,
"rollingCommission": null,
"phone": 1234567890,
"password": "$2b$10$9fjygLW4xj6a.vSTwRE1WOCaXLbeTcsBZwM8p6OrZgGspecfTxtxq",
"partnership": "100",
"invite": "4797F328",
"masterPassword": "123456",
"status": "active",
"role": "supperadmin",
"gamelock": [
{
"game": "cricket",
"lock": true
},
{
"game": "tennis",
"lock": true
},
{
"game": "soccer",
"lock": true
},
{
"game": "Casino",
"lock": true
},
{
"game": "Greyhound Racing",
"lock": true
},
{
"game": "Horse Racing",
"lock": true
},
{
"game": "Basketball",
"lock": true
},
{
"game": "Lottery",
"lock": true
}
],
"sessionToken": "4a2b81e6dcc817ab307ad8ab8ab8760be314b8737ee0797306e653bb3da59e06",
"lastLogin": "2026-02-01T07:24:34.958Z",
"lastDevice": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
"lastIP": "::1",
"createdAt": "2025-06-24T06:51:23.496Z",
"updatedAt": "2026-02-01T07:27:43.866Z",
"\_\_v": 0,
"remark": "sdssa",
"secret": 1,
"baseBalance": 0,
"bettingProfitLoss": 26,
"creditReferenceProfitLoss": 0,
"isPasswordChanged": true,
"uplineBettingProfitLoss": 26
}
}

http://localhost:3000/api/get/my-reports/by-events?page=1&limit=10&startDate=2026-01-01&endDate=2026-02-01
{
"success": true,
"data": {
"report": [
{
"name": "Casino",
"eventName": "poison",
"gameName": "Casino",
"marketName": "WINNER",
"userName": "srijan1",
"date": "2026-02-01T07:24:53.496Z",
"result": "PLAYER B",
"marketId": "6947",
"downlineWinAmount": 0,
"downlineLossAmount": 262,
"myProfit": -262
}
],
"total": {
"name": "Total",
"downlineWinAmount": 0,
"downlineLossAmount": 262,
"myProfit": -262
}
}
}

http://localhost:3000/api/get/my-reports/by-downline?page=1&limit=10&gameName=&eventName=&marketName=&userName=&targetUserId=&startDate=2026-01-01&endDate=2026-02-01

{
"success": true,
"data": {
"reportType": "grouped",
"groupBy": "userName",
"reports": [
{
"name": "srijan1",
"eventName": "poison",
"gameName": "Casino",
"marketName": "WINNER",
"userName": "srijan1",
"date": "2026-02-01T07:24:53.496Z",
"downlineWinAmount": 0,
"downlineLossAmount": 262,
"myProfit": -262,
"result": "PLAYER B",
"marketId": "6947"
}
],
"pagination": {
"page": 1,
"limit": 10,
"total": 1,
"totalPages": 1
},
"downlineProfitReport": [
{
"userId": "697efdf4c62c44c2ff04ec2d",
"role": "admin",
"userName": "master1",
"totalWin": 0,
"totalLoss": 262,
"netProfit": -262,
"directBettingPL": -262,
"hierarchicalPL": 26,
"bettingProfitLoss": 26,
"creditReferenceProfitLoss": 0,
"uplineProfitLoss": 26
}
],
"downlinePagination": {
"page": 1,
"limit": 10,
"total": 1,
"totalPages": 1
},
"overallProfit": {
"totalWin": 0,
"totalLoss": 262,
"netProfit": -262,
"totalBettingProfitLoss": -262,
"totalCreditReferenceProfitLoss": 0
}
}
}

//TASK 18
The problem i am facing is that i am betting on Player A back with odds of 2.04 with stake of 10k this means it will get profit of 10,400 if A wins and loss of 10k if Player B wins
Now i have placed a lay on Player A as well with odds of 2.18 with stake of 10k
now if PLayer B wins it will get 10k and if Player A wins it will 11800
so total exposure is 1400 and if Player A wins it will loss 1400 and if Player B it will loss 0
now Player B has loss in my case in profitLoss it is showing 0 but in my availble balalnce it is deduction 1400 (10k-1.4k) and also bettingProfitLoss is 1.4k what is the exact issue also if i make change it will change my existing logic i want to very carefully properly pls verify properly first
The problem is that if Player B wins the available balance is not returning to 10k
STATUS:FIXED

//TASK19
The problem statement i have received from the client that if suppose under whitelevel there is user whitelevel delete user account then he has to balance and avbalance 0 no creditReferenceProfitLoss 0 pls remove this conditions it should only remove from the list dont delete its any data becuase of suppose any subadmin loses it can delete its user hence covering it loss and also on restore it should not impact any calculation since its balance and avbalance i have made 0 pls go through my problem stament througly also do not remove avbalance comdition
STATUS:FIXED

//TASK10
The problem i have placed 5 lays bets on Tennis(sports) Rebecca vs Vendula
1->bet on Rebecca(lay) odds 1.25 with stake 100
2->bet on Vendula(lay) with odds 5.1 with stake 100
3->bet on Rebecca(lay) with odds 1.29 with stake 100
4->bet on Rebacca(lay) with odds 1.29 with stake 100
5->bet on Rebeccaa(lay) with odds 1.29 with stake 100
The problem i facing is that techinally this is a guranteed loss scenario if Rebecca wins it woill loss 12
and if Vendula wins it will loss 10 with the exposure is coming 28 pls review this scenario and tell me what is the exact problem
