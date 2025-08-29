const express = require('express');
const { createClient } = require('@vercel/kv');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Inicializa o cliente Vercel KV
const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

// Adicione esta rota para a página inicial
app.get('/', (req, res) => {
    res.send('Servidor está funcionando! Use as rotas de API como /carros.');
});

// Rota para ler todos os carros do banco de dados
app.get('/carros', async (req, res) => {
    try {
        // Acessa a lista de carros na chave 'carros'
        const carros = await kv.get('carros') || [];
        res.json(carros);
    } catch (error) {
        console.error('Erro ao ler dados do KV:', error);
        res.status(500).json({ message: 'Erro ao carregar os dados.' });
    }
});

// Rota para adicionar um novo carro
app.post('/carros', async (req, res) => {
    const { placa, piso, horaEntrada } = req.body;
    try {
        const carros = await kv.get('carros') || [];
        const placaExiste = carros.some(carro => carro.placa.toUpperCase() === placa.toUpperCase());
        
        if (placaExiste) {
            return res.status(409).json({ message: 'Placa já cadastrada.' });
        }

        const novoCarro = { placa, piso, horaEntrada };
        carros.push(novoCarro);
        await kv.set('carros', carros);
        res.status(201).json({ message: 'Carro adicionado com sucesso!' });

    } catch (error) {
        console.error('Erro ao adicionar carro:', error);
        res.status(500).json({ message: 'Erro ao adicionar carro.' });
    }
});

// Rota para transferir um carro
app.put('/carros/:placa', async (req, res) => {
    const placa = req.params.placa.toUpperCase();
    const { piso } = req.body;
    try {
        const carros = await kv.get('carros') || [];
        const carroIndex = carros.findIndex(carro => carro.placa.toUpperCase() === placa);

        if (carroIndex === -1) {
            return res.status(404).json({ message: 'Carro não encontrado.' });
        }

        carros[carroIndex].piso = piso;
        await kv.set('carros', carros);
        res.json({ message: 'Carro transferido com sucesso!' });
    } catch (error) {
        console.error('Erro ao transferir carro:', error);
        res.status(500).json({ message: 'Erro ao transferir carro.' });
    }
});

// Rota para remover um carro
app.delete('/carros/:placa', async (req, res) => {
    const placa = req.params.placa.toUpperCase();
    try {
        const carros = await kv.get('carros') || [];
        const newCarros = carros.filter(carro => carro.placa.toUpperCase() !== placa);

        if (newCarros.length === carros.length) {
            return res.status(404).json({ message: 'Carro não encontrado.' });
        }

        await kv.set('carros', newCarros);
        res.json({ message: 'Carro removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover carro:', error);
        res.status(500).json({ message: 'Erro ao remover carro.' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});