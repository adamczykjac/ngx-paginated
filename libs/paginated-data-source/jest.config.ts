import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['node_modules/'],
  moduleNameMapper: {
    '^@angular/core$': '<rootDir>/src/test/angular-core.stub.ts',
    '^@angular/cdk/collections$':
      '<rootDir>/src/test/angular-cdk-collections.stub.ts',
  },
};

export default config;
