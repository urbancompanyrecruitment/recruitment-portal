import development from '../../environment/development.json';
import production from '../../environment/production.json';
import staging from '../../environment/staging.json';
import { DEFAULT_MODE } from './constant';
import { Environment } from './interface';

const ENVIRONMENTS: Record<string, Environment> = { development, staging, production };

export const environment: Environment = ENVIRONMENTS[import.meta.env.MODE] ?? ENVIRONMENTS[DEFAULT_MODE];
