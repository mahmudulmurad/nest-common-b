import { TypeormConfigModule } from './typeorm-config.module';

export function dbConnection() {
  return TypeormConfigModule;
}
