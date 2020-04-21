import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import CreateCategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({
      where: { title: category_title },
    });
    if (!category) {
      const createCategotyService = new CreateCategoryService();
      category = await createCategotyService.execute({ title: category_title });
    }

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > balance.total)
      throw new AppError("You don't have enought found");

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
