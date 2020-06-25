import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const findTransactionById = await transactionsRepository.findOne(id);

    if (!findTransactionById) {
      throw new AppError('Transaction was not found');
    }

    await transactionsRepository.delete(findTransactionById.id);
  }
}

export default DeleteTransactionService;
