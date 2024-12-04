const BLUEPRINT_RE = /Blueprint \d: Each ore robot costs ([\d]+) ore. Each clay robot costs ([\d]+) ore. Each obsidian robot costs ([\d]+) ore and ([\d]+) clay. Each geode robot costs ([\d]+) ore and ([\d]+) obsidian./;

let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const getBlueprints = (data) => {
  return data.split('\n').map((line, i) => {
    const blueprint = { id: `Blueprint ${i+1}`, num: i + 1 };
    
    const matches = line.match(BLUEPRINT_RE);

    if (matches) {
      const [,
        oreBotOreCostRaw,
        clayBotOreCostRaw,
        obsidianBotOreCostRaw, obsidianBotClayCostRaw, 
        geodeBotOreCostRaw, geodeBotObsidianCostRaw
      ] = matches;
      
      blueprint.oreBotOreCost = Number(oreBotOreCostRaw);
      blueprint.clayBotOreCost = Number(clayBotOreCostRaw);
      blueprint.obsidianBotOreCost = Number(obsidianBotOreCostRaw);
      blueprint.obsidianBotClayCost = Number(obsidianBotClayCostRaw);
      blueprint.geodeBotOreCost = Number(geodeBotOreCostRaw);
      blueprint.geodeBotObsidianCost = Number(geodeBotObsidianCostRaw);
    }

    return blueprint;
  });
};

const getBlueprintQuality = (blueprint) => {
  let oreBots = 1;
  let clayBots = 0;
  let obsidianBots = 0;
  let geodeBots = 0;

  let buildingOreBot = false;
  let buildingClayBot = false;
  let buildingObsidianBot = false;
  let buildingGeodeBot = false;

  let ore = 0;
  let clay = 0;
  let obsidian = 0;
  let geodes = 0;

  for (let m = 0; m < 24; m++) {
    log(`\n== Minute ${m+1} ==`);

    // Start building
    // Geode bot
    if (ore >= blueprint.geodeBotOreCost && obsidian >= blueprint.geodeBotObsidianCost) {
      log(`Spend ${blueprint.geodeBotOreCost} ore and ${blueprint.geodeBotObsidianCost} obsidian to start building a geode-cracking robot.`);
      buildingGeodeBot = true;
      ore -= blueprint.geodeBotOreCost;
      obsidian -= blueprint.geodeBotObsidianCost;
    }

    // Obsidian bot
    const geodeOnNext = (ore + (oreBots * 2)) >= blueprint.geodeBotOreCost && (obsidian + (obsidianBots * 2)) >= blueprint.geodeBotObsidianCost;

    if (ore >= blueprint.obsidianBotOreCost && clay >= blueprint.obsidianBotClayCost && !geodeOnNext) {
      log(`Spend ${blueprint.obsidianBotOreCost} ore and ${blueprint.obsidianBotClayCost} clay to start building an obsidian-collecting robot.`);
      buildingObsidianBot = true;
      ore -= blueprint.obsidianBotOreCost;
      clay -= blueprint.obsidianBotClayCost;
    }

    // Clay bot
    const obsidianOnNext = (ore + (oreBots * 2)) >= blueprint.obsidianBotOreCost && (clay + (clayBots * 2)) >= blueprint.obsidianBotClayCost;

    if (ore >= blueprint.clayBotOreCost && !obsidianOnNext && !geodeOnNext) {
      log(`Spend ${blueprint.clayBotOreCost} ore to start building a clay-collecting robot.`);
      buildingClayBot = true;
      ore -= blueprint.clayBotOreCost;
    }

    // Add resources
    ore += oreBots;
    log(`${oreBots} ore-collection bot(s) collect 1 ore; you now have ${ore} ore.`);

    if (clayBots) {
      clay += clayBots;
      log(`${clayBots} clay-collection bot(s) collect 1 clay; you now have ${clay} clay.`);
    }

    if (obsidianBots) {
      obsidian += obsidianBots;
      log(`${obsidianBots} obsidian-collection bot(s) collect 1 obsidian; you now have ${obsidian} obsidian.`);
    }

    if (geodeBots) {
      geodes += geodeBots;
      log(`${geodeBots} geode-cracking robot cracks 1 geode; you now have ${geodes} open geodes.`);
    }

    // Finish building
    if (buildingOreBot) {
      oreBots++;
      log(`The new ore-collecting robot is ready; you now have ${oreBots} of them.`);
      buildingOreBot = false;
    }

    if (buildingClayBot) {
      clayBots++;
      log(`The new clay-collecting robot is ready; you now have ${clayBots} of them.`);
      buildingClayBot = false;
    }

    if (buildingObsidianBot) {
      obsidianBots++;
      log(`The new obsidian-collecting robot is ready; you now have ${obsidianBots} of them.`);
      buildingObsidianBot = false;
    }

    if (buildingGeodeBot) {
      geodeBots++;
      log(`The new geode-cracking robot is ready; you now have ${geodeBots} of them.`);
      buildingGeodeBot = false;
    }
  }

  return blueprint.num * geodes;
};

const getAllQualities = (blueprints) => {
  const qualities = blueprints.map(getBlueprintQuality);
  console.log('qualities', qualities);
  return qualities.reduce((acc, q) => acc + q, 0);
};

const getResult = (data) => {
  isLogging = true;
  const blueprints = getBlueprints(data);
  getBlueprintQuality(blueprints[1]);
  return 0;//getAllQualities(blueprints);
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };
