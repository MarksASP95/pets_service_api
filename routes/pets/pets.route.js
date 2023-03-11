const express = require('express');
const router = express.Router();
const { Pet } = require("../../models/Pet.model");
const { Owner } = require("../../models/Owner.model");
const mongoose = require("mongoose");
const { validatePetCreateData, validatePetUpdateData } = require('../../utils/pets.util');
const { validateOwnerCreateData } = require('../../utils/owners.util');

router.get('/', async function(req, res) {
  let page = req.query.page ? parseInt(req.query.page): 1;
  let pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;

  if (typeof page !== "number" || typeof pageSize !== "number") {
    res.status(400).send("Bad request");
    return;
  }

  const count = await Pet.count();
  const items = await Pet.find()
    .populate("owner")
    .skip(pageSize * (page - 1))
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
    const pet = await Pet.findOne({ _id: id }).populate("owner");
    if (!!pet) res.json({ pet });
    return;
  } catch (error) { }

  res.status(404).send("Not found");
});

router.post('/new', async function(req, res) {
  const data = req.body;
  const { name, owner, size } = data;

  const petParseResult = validatePetCreateData({ name, size });
  if (!petParseResult.success) {
    res.status(400).send({ success: false, error: JSON.parse(petParseResult.error.message) });
    return;
  }

  if (owner?.type === "id") {
    try {
      const foundOwner = await Owner.findOne({ _id: owner.payload?.id });
      if (!foundOwner) {
        res.status(404).send({ success: false, error: "Owner not found" });
        return;
      }
    } catch (error) {
      res.status(404).send({ success: false, error: "Owner not found" });
      return;
    }
  } else if (owner?.type === "new") {
    if (!owner.payload) {
      res.status(400).send({ success: false, error: "No owner data provided" });
      return;
    }
    

    const ownerParseResult = validateOwnerCreateData(owner.payload);
    if (!ownerParseResult.success) {
      res.status(400).send({ success: false, error: JSON.parse(petParseResult.error.message) });
      return;
    }
  } else {
    res.status(400).send({ success: false, error: "No owner data provided" });
    return;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let ownerId;
    if (owner.type === "id") {
      ownerId = owner.payload.id;
    } else if (owner.type === "new") {
      const newOwner = new Owner({
        name: owner.payload.name,
        phone: owner.payload.phone,
      });

      await newOwner.save();
      ownerId = newOwner._id;
    }

    const newPet = new Pet({ name, ownerId, size });
    await newPet.save();

    await session.commitTransaction();
  } catch (error) {
    res.status(500).send({ success: false, error: "Error saving data" });
    console.log(error);
    return;
  } finally {
    session.endSession();
  }

  res.status(200).send({ success: true });
});

router.put('/:id', async function(req, res) {
  const { id } = req.params;
  const { name, size, ownerId } = req.body;

  const petParseResult = validatePetUpdateData({ name, size, ownerId });
  if (!petParseResult.success) {
    res.status(400).send({ success: false, error: JSON.parse(petParseResult.error.message) });
    return;
  }

  if (!!ownerId) {
    try {
      const owner = await Owner.findOne({ _id: ownerId }).exec();
      if(!owner) {
        res.status(404).send({ success: false, error: "Owner not found" });
        return;
      }
    } catch (error) {
      res.status(404).send({ success: false, error: "Owner not found" });
      return;
    }
  }

  const petUpdateData = {};
  if (!!name) petUpdateData.name = name;
  if (!!size) petUpdateData.size = size;
  if (!!ownerId) petUpdateData.ownerId = ownerId;
  
  try {
    await Pet.findOneAndUpdate({ _id: id }, petUpdateData, { upsert: false }).exec();
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).status({ success: false, error: "Could not update pet" });
  }
});

module.exports = router;
