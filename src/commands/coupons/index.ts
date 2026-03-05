import { Command } from 'commander';
import { createCouponCreateCommand } from './create';
import { createCouponGetCommand } from './get';
import { createCouponListCommand } from './list';
import { createCouponUpdateCommand } from './update';
import { createCouponDeleteCommand } from './delete';

export function createCouponsCommands(): Command {
  const coupons = new Command('coupons')
    .description('Manage coupons');

  coupons.addCommand(createCouponCreateCommand());
  coupons.addCommand(createCouponGetCommand());
  coupons.addCommand(createCouponListCommand());
  coupons.addCommand(createCouponUpdateCommand());
  coupons.addCommand(createCouponDeleteCommand());

  return coupons;
}
