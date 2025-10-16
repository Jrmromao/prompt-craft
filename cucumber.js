module.exports = {
  default: {
    require: ['__tests__/bdd/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};
