const express = require('express');
const router = express.Router();
const { Pet } = require("../../models/Pet.model");
const { Owner } = require("../../models/Owner.model");
const { Service } = require("../../models/Service.model");
const { ServiceRequest } = require("../../models/ServiceRequest.model");
const mongoose = require("mongoose");
const { validateOwnerCreateData } = require('../../utils/owners.util');
const { 
  validateServiceCreateData, 
  validateServiceRequestCreateData,
  validateServiceRequestStatus
} = require('../../utils/service.util');

router.get('/', async function(req, res) {
    let page = req.query.page ? parseInt(req.query.page): 1;
    let pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  
    if (typeof page !== "number" || typeof pageSize !== "number") {
      res.status(400).send("Bad request");
      return;
    }
  
    const count = await Service.count();
    const items = await Service.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .exec();
  
    res.json({ items, count, page, pageSize });
});

router.get('/requests', async function (req, res) {
  let page = req.query.page ? parseInt(req.query.page): 1;
  let pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;

  if (typeof page !== "number" || typeof pageSize !== "number") {
    res.status(400).send("Bad request");
    return;
  }

  const count = await ServiceRequest.count();
  const items = await ServiceRequest.find()
    .populate("services")
    .populate("pet")
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .exec();

  res.json({ items, count, page, pageSize });
});

router.put('/requests/set-status', async function (req, res) {
  const { status, requestId } = req.body;

  const statusParseResult = validateServiceRequestStatus(status);

  let request;
  if (statusParseResult.success) {
    try {
      request = await ServiceRequest.findOne({ _id: requestId });
      if (!request) {
        return res
          .status(404)
          .send({ success: false, error: `Request with ID ${requestId} does not exist` });
      }

      switch(status) {
        case "due": {
          if (request.status !== "in_process") {
            return res
              .status(412)
              .send({ success: false, error: "Cannot set request as due if it's not in process" });
          }

          await ServiceRequest.updateOne({ _id: requestId }, { status: "due" });
          break;
        }
        case "in_process": {
          if (request.status !== "due") {
            return res
              .status(412)
              .send({ success: false, error: "Cannot set a request in process if it's not in due" });
          }

          await ServiceRequest.updateOne({ _id: requestId }, { status: "in_process" });
          break;
        }
        case "done": {
          if (request.status !== "in_process") {
            return res
              .status(412)
              .send({ success: false, error: "Cannot set a request as done if it's not in process" });
          }

          await ServiceRequest.updateOne({ _id: requestId }, { status: "done" });
          break;
        }
        case "cancelled": {
          if (request.status !== "due" && request.status !== "in_process") {
            return res
              .status(412)
              .send({ success: false, error: "Cannot set a request as cancelled if it's not due or in process" });
          }

          await ServiceRequest.updateOne({ _id: requestId }, { status: "cancelled" });
          break;
        }
      }

      return res.send({ success: true });
    } catch (error) {
      return res.status(500).send({ success: false, error: "Error querying database" });
    }
  } else {
    res
      .status(400)
      .send({ success: false, error: JSON.parse(statusParseResult.error.message) });
    return;
  }
});

router.post('/requests/new', async function (req, res) {
  const data = req.body;

  const serviceRequestParseResult = validateServiceRequestCreateData(data);
  if (serviceRequestParseResult.success) {

      const petP = Pet.findOne({ _id: data.petId });
      const servicesPs = data.servicesIds.map((sId) => Service.findOne({ _id: sId }));

      let pet, services;
      try {
        const [_pet, _services] = await Promise.all([
          petP,
          Promise.all(servicesPs)
        ]);
        pet = _pet;
        services = _services;
      } catch (error) {
        return res.status(500).send({ success: false, error: `Error while querying database` });
      }

      if (!pet) {
        return res
          .status(404)
          .send({ success: false, error: `Pet with ID ${data.petId} does not exist` });
      }
      for (let i = 0; i < services.length; i++) {
        if (!services[i]) {
          return res
            .status(404).send({ 
              success: false, 
              error: `Service with ID ${data.servicesIds[i]} does not exist` 
            });
        }
      }

      try {
          await new ServiceRequest({
            ...data,
            status: "due",
          }).save();
          res.send({ success: true });
          return;
      } catch (error) {
          res.status(500).send({ success: false, error: "Could not save service request" });
      }
  } else {
      res
        .status(400)
        .send({ success: false, error: JSON.parse(serviceRequestParseResult.error.message) });
      return;
  }

  res.status(200).send({ success: true });
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