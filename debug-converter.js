// 调试转换器脚本
import { UnitConverterEngine } from './2base/src/tools/unit-converter/lib/engine.js';
import { unitCategories } from './2base/src/tools/unit-converter/lib/data.js';

console.log('🔍 调试单位转换器...\n');

// 创建引擎实例
const engine = new UnitConverterEngine(unitCategories);

// 测试速度分类
console.log('📊 测试速度分类:');
const speedCategory = unitCategories.find(c => c.id === 'speed');
if (speedCategory) {
  console.log(`✅ 找到速度分类: ${speedCategory.name}`);
  console.log(`📋 单位组数量: ${speedCategory.groups.length}`);
  
  speedCategory.groups.forEach((group, i) => {
    console.log(`  ${i + 1}. ${group.name}:`);
    group.units.forEach(unit => {
      console.log(`     - ${unit.name} (${unit.symbol}) - ID: ${unit.id}`);
    });
  });
  
  // 测试转换
  try {
    const firstUnit = speedCategory.groups[0].units[0];
    console.log(`\n🔄 测试转换 (从 ${firstUnit.name}):`)
    const results = engine.convertToAll(1, firstUnit.id, 'speed');
    console.log(`✅ 转换成功，结果数量: ${results.length}`);
    results.slice(0, 3).forEach(result => {
      console.log(`  ${result.unit.name}: ${result.formattedValue} ${result.unit.symbol}`);
    });
  } catch (error) {
    console.log(`❌ 转换失败:`, error.message);
  }
} else {
  console.log('❌ 未找到速度分类');
}

console.log('\n📊 测试数据存储分类:');
const digitalCategory = unitCategories.find(c => c.id === 'digital');
if (digitalCategory) {
  console.log(`✅ 找到数据存储分类: ${digitalCategory.name}`);
  console.log(`📋 单位组数量: ${digitalCategory.groups.length}`);
  
  digitalCategory.groups.forEach((group, i) => {
    console.log(`  ${i + 1}. ${group.name}:`);
    group.units.forEach(unit => {
      console.log(`     - ${unit.name} (${unit.symbol}) - ID: ${unit.id}`);
    });
  });
  
  // 测试转换
  try {
    const firstUnit = digitalCategory.groups[0].units[0];
    console.log(`\n🔄 测试转换 (从 ${firstUnit.name}):`)
    const results = engine.convertToAll(1, firstUnit.id, 'digital');
    console.log(`✅ 转换成功，结果数量: ${results.length}`);
    results.slice(0, 3).forEach(result => {
      console.log(`  ${result.unit.name}: ${result.formattedValue} ${result.unit.symbol}`);
    });
  } catch (error) {
    console.log(`❌ 转换失败:`, error.message);
  }
} else {
  console.log('❌ 未找到数据存储分类');
}

console.log('\n📋 所有分类列表:');
unitCategories.forEach((category, i) => {
  console.log(`${i + 1}. ${category.id}: ${category.name}`);
}); 