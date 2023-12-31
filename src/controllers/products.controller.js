import { productManager } from "../services/factory.js";

const getProductsPipelineController = async (req, res) => {
    const { limit, page, query, sort } = req.query;
    res.set('Content-Type', 'application/json');
    const productos = await productManager.getProductsPipeline(parseInt(limit), parseInt(page), query, sort);
    res.status(200);
    res.send(productos);
}

const getProductByIdController = async (req, res) => {
    const productId = req.params.pid;
    const productoBuscado = await productManager.getProductById(productId);
    res.set('Content-Type', 'application/json');
    if (productoBuscado !== false) {
        res.status(200);
        res.send(productoBuscado);
    } else {
        res.status(404);
        res.send('{"status": "failed", "message": "Product not found"}');
    }
}

const postAddProductController = async (req, res) => {
    res.set('Content-Type', 'application/json');
    try {
        const nuevoProducto = JSON.parse(await productManager.addProduct(req.body));
        if (nuevoProducto.status === "ok") {
            res.send(`{"status": "ok"}`);
        } else {
            res.send(`{"status": "failed", "message": "${nuevoProducto.message}" }`);
        }
    } catch (error) {
        console.error(error);
        res.send(`{"status": "failed", "message": "${error.message}" }`);
    }
}

const putUpdateProductController = async (req, res) => {
    const productId = req.params.pid;
    res.set('Content-Type', 'application/json');
    const actualizarProducto = JSON.parse(await productManager.updateProduct(productId, req.body));
    if (actualizarProducto.status === "ok") {
        res.status(201);
        res.send(`{"status": "ok"}`);
    } else {
        res.status(400);
        res.send(`{"status": "failed", "message": "${actualizarProducto.message}" }`);
    }

}

const deleteProductController = async (req, res) => {
    const productId = req.params.pid;
    res.set('Content-Type', 'application/json');
    const eliminarProducto = JSON.parse(await productManager.deleteProduct(productId));
    if (eliminarProducto.status === "ok") {
        res.status(200).send(`{"status": "ok"}`);
    } else {
        res.status(400).send(`{"status": "failed", "message": "${eliminarProducto.message}" }`);
    }
}

const deleteMiddleWare = async (req, res, next) => {
    if (!req.session.users) {
        res.status(401).send({ status: 'failed', message: 'Cannot delete. You are not logged in' });
    } else {
        if (req.session.user.role === 'Admin') {
            next();
        } else if (req.session.user.role === 'Premium') {
            const pid = req.params.pid;
            const producto = await productManager.getProductById(pid);
            if (producto.owner === req.session.user.id) {
                next();
            } else {
                res.status(401).send({ status: 'failed', message: "Cannot delete. You're not owner of this product... =/" });
            }
        } else {
            res.status(401).send({ status: 'failed', message: 'Cannot delete. No permission allowed... =/' });
        }
    }
}


export { getProductsPipelineController, getProductByIdController, postAddProductController, putUpdateProductController, deleteProductController, deleteMiddleWare }
