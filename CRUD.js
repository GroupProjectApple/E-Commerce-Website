const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Generic POST function to create documents in any collection
router.post('/:collection', async (req, res) => {
    const { collection } = req.params;  // Dynamic collection name from URL
    const modelName = collection; 

    if (!isValidCollectionName(collection)) {
        return res.status(400).json({ message: "Invalid collection name" });
    }

    // Get Mongoose Model by collection name dynamically
    const Model = mongoose.models[modelName] || mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));

    // Create a new instance of the model (generic document)
    const newDocument = new Model(req.body);

    try {
        // Save the document in the corresponding collection
        await newDocument.save();
        res.status(201).json({ message: `${modelName} created successfully`, data: newDocument });
    } catch (error) {
        res.status(500).json({ message: `Error creating ${modelName}`, error });
    }
});

// Generic GET function to retrieve documents from any collection

router.get('/:collection', async (req, res) => {
    const { collection } = req.params;  // Dynamic collection name from URL
    const { aggregate } = req.query;    // Check if aggregate is passed as a query param
    console.log(collection,aggregate);

    // Validate collection name (add your own validation rules)
    if (!isValidCollectionName(collection)) {
        return res.status(400).json({ message: "Invalid collection name" });
    }

    // Dynamically get the model based on the collection name
    const modelName = collection;
    const Model = mongoose.models[modelName] || mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));

    try {
        let documents;

        if (aggregate === 'true') {
            // Dynamic aggregation pipeline, passed via query or request body
            const aggregationPipeline = req.body.pipeline || req.query.pipeline;
            
            if (!aggregationPipeline) {
                return res.status(400).json({ message: "No aggregation pipeline provided" });
            }

            // Parse the pipeline from query or request body
            let parsedPipeline;
            try {
                parsedPipeline = typeof aggregationPipeline === 'string' ? JSON.parse(aggregationPipeline) : aggregationPipeline;
                console.log(parsedPipeline);
            } catch (err) {
                return res.status(400).json({ message: "Invalid aggregation pipeline format", error: err });
            }

            // Check if parsedPipeline is a valid array
            if (!Array.isArray(parsedPipeline)) {
                return res.status(400).json({ message: "Aggregation pipeline must be an array" });
            }

            // Perform the aggregation query with the provided pipeline
            documents = await Model.aggregate(parsedPipeline);
        } else {
            // Perform a normal find query, using query parameters as filters if any
            const query = req.query || {};
            documents = await Model.find(query);
        }

        // Check if no documents are found
        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: `No documents found in collection ${modelName}` });
        }

        // Return the found documents
        res.status(200).json(documents);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: `Error fetching data from ${modelName}`, error });
    }
});

router.put('/update', async (req, res) => {
    const { collectionName, searchFields,searchFields1, updatedValues } = req.body;

    // Check if all required parameters are provided
    if (!collectionName || !searchFields || !updatedValues) {
        return res.status(400).json({ message: "Missing update parameters" });
    }

    console.log("Received Request: ", collectionName, searchFields, updatedValues);

    // Dynamically get or create the Mongoose model
    try {
        // Validate collection name
        if (!isValidCollectionName(collectionName)) {
            return res.status(400).json({ message: "Invalid collection name" });
        }

        // Create dynamic schema with strict: false (allowing flexibility)
        const Model = mongoose.models[collectionName] || 
                      mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

        // Create the query and update objects
        const query = { ...searchFields };    // Ensure searchFields are passed correctly
        const update = { ...updatedValues };  // Ensure updatedValues are handled as an object

        // Check if updatedValues includes a $push operator
        console.log("Query: ", query);
        console.log("Update Operation: ", update);

        // Perform updateMany operation with proper options (upsert if needed)
        const result = await Model.updateMany(query, update, { runValidators: false, upsert: false });

        // Check the matched and modified count in the result
       
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No items found to update." });
        }
        let doc;
        if(searchFields1){
        doc=await Model.find({...searchFields1});}
        else{doc=await Model.find(query);}


        // Send a success message with the result
        res.status(200).json(doc);
    } catch (error) {
        // Catch any errors and send a 500 response with the error message
        console.error("Error during update: ", error);
        res.status(500).json({ message: `Error updating data in ${collectionName}`, error });
    }
});




router.delete('/:collection', async (req, res) => {
    const { collection } = req.params; // Capture collection from URL
    const { query } = req.body; // Change to capture query from body

    if (!isValidCollectionName(collection)) {
        return res.status(400).json({ message: "Invalid collection name" });
    }
    
    console.log("Collection:", collection); // Log the actual collection
    console.log("Query:", query); // Log the actual query

    try {
        const Model = mongoose.models[collection] || mongoose.model(collection, new mongoose.Schema({}, { strict: false }));
        const result = await Model.deleteMany(query);

        // Check if any documents were deleted
        /*if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No documents found matching the criteria' });
        }*/

        res.status(200).json({ message: 'Documents deleted successfully', result });
    } catch (error) {
        console.error('Error occurred while deleting documents:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Function to validate collection name (implement your own rules)
function isValidCollectionName(collectionName) {
    // Example validation: collection name should only be alphanumeric and underscores
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(collectionName);
}


module.exports = router;
