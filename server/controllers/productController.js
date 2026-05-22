import Product from '../models/Product.js';
import { SERVER_URL } from '../constants.js';

export const createProduct = async (req, res) => {
  try {
    const { productCode, weight, sections } = req.body;
    
    const existingProduct = await Product.findOne({ productCode });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product code already exists' });
    }

    let parsedSections = [];
    if (sections) {
      try {
        parsedSections = JSON.parse(sections);
      } catch (e) {
        parsedSections = Array.isArray(sections) ? sections : [sections];
      }
    }

    const images = req.files ? req.files.map(file => `${SERVER_URL}/uploads/${file.filename}`) : [];

    const product = new Product({
      productCode,
      weight,
      images,
      sections: parsedSections,
      workspace: req.user.workspace,
      createdBy: req.user._id
    });

    await product.save();
    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error while creating product' });
  }
};

export const getProducts = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin' && req.user.workspace) {
       query.workspace = req.user.workspace;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productCode, weight, sections, existingImages } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Ensure unique product code if changed
    if (productCode && productCode !== product.productCode) {
      const existing = await Product.findOne({ productCode });
      if (existing) return res.status(400).json({ error: 'Product code already exists' });
      product.productCode = productCode;
    }

    if (weight) product.weight = weight;

    if (sections) {
      try {
        product.sections = JSON.parse(sections);
      } catch (e) {
        product.sections = Array.isArray(sections) ? sections : [sections];
      }
    }

    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (e) {
        updatedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      }
    } else if (req.body.existingImages === '') {
      updatedImages = []; // All images deleted
    } else {
      updatedImages = product.images; // Default keep existing
    }

    const newImages = req.files ? req.files.map(file => `${SERVER_URL}/uploads/${file.filename}`) : [];
    product.images = [...updatedImages, ...newImages];

    await product.save();
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error while updating product' });
  }
};
