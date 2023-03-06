const express = require('express');
const router = express.Router();
const { Pet } = require("../../models/Pet.model");
const { Owner } = require("../../models/Owner.model");
const { Service } = require("../../models/Service.model");
const mongoose = require("mongoose");
const { validateOwnerCreateData } = require('../../utils/owners.util');
const { validateServiceCreateData } = require('../../utils/service.util');

router.get('/', async function(req, res) {
    let page = req.query.page ? parseInt(req.query.page) : 0;
    let pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  
    if (typeof page !== "number" || typeof pageSize !== "number") {
      res.status(400).send("Bad request");
      return;
    }
  
    const count = await Service.count();
    const items = await Service.find()
      .skip(pageSize * page)
      .limit(pageSize)
      .exec();
  
    res.json({ items, count, page, pageSize });
});
  
router.get('/:id', async function(req, res) {
    const id = req.params.id;
  
    if (!id) {
      res.status(400).send("Bad request");
      return;
    }
  
    try {
      const service = await Service.findOne({ _id: id });
      if (!!service) res.json({ service });
      return;
    } catch (error) { }
  
    res.status(404).send("Not found");
});
  
router.post('/new', async function(req, res) {
    const data = req.body;

    const serviceParseResult = validateServiceCreateData(data);
    if (serviceParseResult.success) {
        try {
            await new Service(data).save();
            res.send({ success: true });
            return;
        } catch (error) {
            res.status(500).send({ success: false, error: "Could not save service" });
        }
    } else {
        res.status(400).send({ success: false, error: JSON.parse(serviceParseResult.error.message) });
        return;
    }
  
    res.status(200).send({ success: true });
});

module.exports = router;