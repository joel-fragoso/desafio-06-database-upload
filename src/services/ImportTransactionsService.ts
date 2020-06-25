import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository, getRepository } from 'typeorm';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  file: string;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, file);

    const readCSVStreem = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      trim: true,
      skip_empty_lines: true,
      columns: true,
    });

    const parseCSV = readCSVStreem.pipe(parseStream);

    const transactions: Transaction[] = [];

    parseCSV.on('data', transaction => transactions.push(transaction));

    await new Promise(resolve => parseCSV.on('end', resolve));

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    // const categoriesRepository = getRepository(Category);

    const createTransactions = transactionsRepository.create(transactions);

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
