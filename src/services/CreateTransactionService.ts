import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type is invalid');
    }

    if (type === 'outcome' && total < value) {
      throw new AppError('Your balance is insufficient');
    }

    let category_id = '';

    const findCategoryByTitle = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (findCategoryByTitle) {
      category_id = findCategoryByTitle.id;
    } else {
      const { identifiers } = await categoriesRepository.insert({
        title: category,
      });

      category_id = identifiers[0].id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
