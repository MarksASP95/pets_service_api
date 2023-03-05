const express = require('express');
const router = express.Router();
const { Pet } = require("../../models/Pet.model");
const { Owner } = require("../../models/Owner.model");
const mongoose = require("mongoose");
const { validatePetCreateData, validatePetUpdateData } = require('../../utils/pets.util');
const { validateOwnerCreateData } = require('../../utils/owners.util');

router.get('/', async function(req, res) {
    let page = req.query.page ? parseInt(req.query.page) : 0;
    let pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  
    if (typeof page !== "number" || typeof pageSize !== "number") {
      res.status(400).send("Bad request");
      return;
    }
  
    const count = await Owner.count();
    const items = await Owner.find()
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
      const owner = await Owner.findOne({ _id: id });
      if (!!owner) res.json({ owner });
      return;
    } catch (error) { }
  
    res.status(404).send("Not found");
});
  
router.post('/new', async function(req, res) {
    const data = req.body;

    const ownerParseResult = validateOwnerCreateData(data);
    if (ownerParseResult.success) {
        try {
            await new Owner(data).save();
            res.send({ success: true });
            return;
        } catch (error) {
            res.status(500).send({ success: false, error: "Could not save owner" });
        }
    } else {
        res.status(400).send({ success: false, error: JSON.parse(ownerParseResult.error.message) });
        return;
    }
  
    res.status(200).send({ success: true });
});

module.exports = router;