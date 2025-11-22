const axios = require('axios');
require('dotenv').config();

async function getBonkTopHolders() {
  const apiKey = process.env.HELIUS_API_KEY;
  const bonkAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
  
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              BONK Top 10 Holders Analysis                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  // Step 1: Get largest token accounts
  console.log('Step 1: Getting largest BONK token accounts...\n');
  
  const response = await axios.post(
    `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenLargestAccounts',
      params: [bonkAddress]
    }
  );
  
  if (!response.data.result || !response.data.result.value) {
    console.log('❌ Failed to get token accounts');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    process.exit(1);
  }
  
  const largestAccounts = response.data.result.value.slice(0, 10);
  
  // Step 2: Get total supply
  const supplyResponse = await axios.post(
    `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenSupply',
      params: [bonkAddress]
    }
  );
  
  const totalSupply = supplyResponse.data.result.value.uiAmount;
  
  console.log(`Total BONK Supply: ${totalSupply.toLocaleString()}\n`);
  console.log('Step 2: Finding wallet owners for each token account...\n');
  
  // Step 3: Get owner for each token account
  const holders = [];
  
  for (let i = 0; i < largestAccounts.length; i++) {
    const account = largestAccounts[i];
    
    try {
      const accountInfo = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [
            account.address,
            { encoding: 'jsonParsed' }
          ]
        }
      );
      
      const parsed = accountInfo.data.result?.value?.data?.parsed;
      if (parsed?.info) {
        const owner = parsed.info.owner;
        const balance = account.uiAmount;
        const percentage = (balance / totalSupply * 100).toFixed(4);
        
        holders.push({
          rank: i + 1,
          tokenAccount: account.address,
          walletOwner: owner,
          balance: balance,
          percentage: percentage
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Could not get owner for account ${i + 1}`);
    }
  }
  
  // Display results
  console.log('═'.repeat(70));
  console.log('TOP 10 BONK HOLDERS');
  console.log('═'.repeat(70));
  console.log();
  
  holders.forEach(holder => {
    console.log(`${holder.rank}. RANK #${holder.rank}`);
    console.log(`   Wallet Owner:    ${holder.walletOwner}`);
    console.log(`   Token Account:   ${holder.tokenAccount}`);
    console.log(`   Balance:         ${holder.balance.toLocaleString()} BONK`);
    console.log(`   % of Supply:     ${holder.percentage}%`);
    console.log();
  });
  
  // Calculate concentration
  const top3 = holders.slice(0, 3).reduce((sum, h) => sum + parseFloat(h.percentage), 0);
  const top5 = holders.slice(0, 5).reduce((sum, h) => sum + parseFloat(h.percentage), 0);
  const top10 = holders.reduce((sum, h) => sum + parseFloat(h.percentage), 0);
  
  console.log('═'.repeat(70));
  console.log('CONCENTRATION ANALYSIS');
  console.log('═'.repeat(70));
  console.log(`Top 3 holders control:  ${top3.toFixed(2)}% of supply`);
  console.log(`Top 5 holders control:  ${top5.toFixed(2)}% of supply`);
  console.log(`Top 10 holders control: ${top10.toFixed(2)}% of supply`);
  
  // Risk assessment
  let risk = 'Low ✅';
  if (top10 > 80) risk = 'CRITICAL 🚨';
  else if (top10 > 60) risk = 'High ⚠️';
  else if (top10 > 40) risk = 'Medium ⚠️';
  
  console.log(`\nConcentration Risk: ${risk}`);
  console.log('═'.repeat(70));
  
  // Identify likely exchanges/pools
  console.log('\n💡 LIKELY ACCOUNT TYPES:\n');
  holders.forEach(holder => {
    let type = 'Unknown';
    const owner = holder.walletOwner;
    
    // Common patterns
    if (owner.startsWith('5Q544fK')) type = 'Likely Exchange (Raydium/Orca Pool)';
    else if (owner.startsWith('5hpfC')) type = 'Likely Liquidity Pool';
    else if (owner.startsWith('F8Fq')) type = 'Likely Exchange Wallet';
    else if (owner.startsWith('8voV')) type = 'Likely Liquidity Pool';
    else type = 'Individual/Unknown';
    
    console.log(`${holder.rank}. ${type}`);
    console.log(`   ${owner}`);
    console.log();
  });
}

getBonkTopHolders()
  .then(() => {
    console.log('✨ Analysis complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
