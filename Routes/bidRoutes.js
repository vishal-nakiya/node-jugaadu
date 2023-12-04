const express = require('express');
const Router = express.Router();
const BidController = require('../http/Controllers/BidController');
const authMiddleware = require('../http/middlewares/authMiddleware');

Router.post('/create', authMiddleware, BidController().AddBidAmount);

Router.get('/winner/list', authMiddleware, BidController().readBidAmount);

Router.post('/winner/manually', authMiddleware, BidController().createManuallyWinner);


module.exports = Router;
