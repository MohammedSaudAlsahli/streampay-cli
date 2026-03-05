import { Command } from 'commander';
import { createProductCreateCommand } from './create';
import { createProductGetCommand } from './get';
import { createProductListCommand } from './list';
import { createProductUpdateCommand } from './update';
import { createProductDeleteCommand } from './delete';

export function createProductCommands(): Command {
  const products = new Command('products')
    .description('Manage products');

  products.addCommand(createProductCreateCommand());
  products.addCommand(createProductGetCommand());
  products.addCommand(createProductListCommand());
  products.addCommand(createProductUpdateCommand());
  products.addCommand(createProductDeleteCommand());

  return products;
}
