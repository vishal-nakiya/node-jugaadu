const WalletBalance = require("../../Models/WalletBalance");
const WithdrawRequest = require("../../Models/WithdrawRequest");
const { validationResult } = require("express-validator");


const WithdrawRequestController = () => {
    return {
        WithdrawRequest: async (req, res) => {
            try {
                // Checking validation errors, using express-validator
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg
                        };
                    })
                    return res.status(409).json({ error, success: false });
                }

                //creating data object for insertion
                const data = {
                    user_id: req.body.user_id,
                    request_amount: req.body.request_amount,
                }

                const Request = await WithdrawRequest.create(data);
                return res.status(200).json({ success: true, message: "Withdraw request Created Succesfully" });

            } catch (error) {
                console.log(error);
                res.status(500).json({ success: false, message: "Internal Server error", });
            }
        },
        Readrequests: async (req, res) => {
            try {
                const mydata = await WithdrawRequest.findAll({
                    where: {
                        deleted_at: null,
                        accept_decline: null
                    },
                    attributes: {
                        exclude: ["deleted_at", "auth_token", "refresh_token"],
                    },
                })
                if (!mydata.length) return res.status(400).json({
                    success: false,
                    message: "No request found!",
                });
                //FINALLY, Sending data in response
                res.status(200).json({
                    success: true,
                    message: "Request data fetch succesfully",
                    data: mydata,
                })
            } catch (error) {
                console.log(error);
                res.status(500).json({ success: false, message: "Internal Server error", });
            }
        },
        RequestsAccept: async (req, res) => {
            try {
                const WithdrawRequestData = await WithdrawRequest.findOne({
                    where: {
                        deleted_at: null,
                        id: req.body.withdraw_request_id
                    },
                })
                if (!WithdrawRequestData) return res.status(400).json({
                    success: false,
                    message: "No request data found!",
                });

                const walletdataget = await WalletBalance.findOne({
                    where: {
                        user_id: WithdrawRequestData.dataValues.user_id
                    },
                    order: [["id", "DESC"]]
                })
                const data = {
                    user_id: WithdrawRequestData.dataValues.user_id,
                    debit_credit: 0,
                    amount: parseFloat(WithdrawRequestData.dataValues.request_amount),
                    running_balance: parseFloat(walletdataget.dataValues.running_balance) - parseFloat(WithdrawRequestData.dataValues.request_amount)
                }
                const walletdatacreate = await WalletBalance.create(data);

                const updatewithdrawrequest = await WithdrawRequest.update({ accept_decline: 1 }, {
                    where: {
                        deleted_at: null,
                        id: req.body.withdraw_request_id
                    },
                })
                //FINALLY, Sending data in response
                res.status(200).json({
                    success: true,
                    message: "Request accepted",
                })
            } catch (error) {
                console.log(error);
                res.status(500).json({ success: false, message: "Internal Server error", });
            }
        },
    }
};

module.exports = WithdrawRequestController