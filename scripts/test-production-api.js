const { default: fetch } = require('node-fetch');

async function testProductionAPI() {
  console.log('🌐 TEST DE L\'API DE PRODUCTION RAILWAY\n');

  try {
    // 1. Test de l'API reports
    console.log('1️⃣ TEST API REPORTS (7 derniers jours)');
    
    const reportsResponse = await fetch('https://alamigestion-production.up.railway.app/api/dashboard/stats?days=7');
    
    if (!reportsResponse.ok) {
      console.log(`❌ Erreur HTTP: ${reportsResponse.status}`);
      return;
    }

    const reportsData = await reportsResponse.json();
    
    console.log('✅ Réponse API reçue');
    console.log(`📊 Top produits: ${reportsData.topProducts?.length || 0}`);
    
    if (reportsData.topProducts && reportsData.topProducts.length > 0) {
      console.log('\n🏆 TOP 5 PRODUITS (PRODUCTION):');
      reportsData.topProducts.forEach((product, index) => {
        const isCharnir = product.name.toLowerCase().includes('charnir');
        const marker = isCharnir ? '🎯' : '  ';
        
        console.log(`${marker} ${index + 1}. ${product.name} (${product.sku})`);
        console.log(`      Quantité: ${product.quantity} unités`);
        console.log(`      Total: ${product.total} DH`);
      });
      
      // Chercher Charnir 3D
      const charniRProduct = reportsData.topProducts.find(p => 
        p.name.toLowerCase().includes('charnir') || 
        p.sku === '000'
      );
      
      if (charniRProduct) {
        console.log(`\n🎯 "Charnir 3D" TROUVÉ dans le top ${reportsData.topProducts.indexOf(charniRProduct) + 1}!`);
        console.log(`   Quantité: ${charniRProduct.quantity} unités`);
        console.log(`   Total: ${charniRProduct.total} DH`);
      } else {
        console.log('\n❌ "Charnir 3D" NON TROUVÉ dans le top 5');
      }
    }

    // 2. Test avec période d'1 jour (aujourd'hui)
    console.log('\n2️⃣ TEST API REPORTS (1 jour - aujourd\'hui)');
    
    const todayResponse = await fetch('https://alamigestion-production.up.railway.app/api/dashboard/stats?days=1');
    
    if (todayResponse.ok) {
      const todayData = await todayResponse.json();
      
      console.log(`📊 Top produits aujourd'hui: ${todayData.topProducts?.length || 0}`);
      
      if (todayData.topProducts && todayData.topProducts.length > 0) {
        console.log('\n🏆 TOP PRODUITS AUJOURD\'HUI:');
        todayData.topProducts.forEach((product, index) => {
          const isCharnir = product.name.toLowerCase().includes('charnir');
          const marker = isCharnir ? '🎯' : '  ';
          
          console.log(`${marker} ${index + 1}. ${product.name} (${product.sku})`);
          console.log(`      Quantité: ${product.quantity} unités`);
          console.log(`      Total: ${product.total} DH`);
        });
      } else {
        console.log('📊 Aucune vente aujourd\'hui');
      }
    }

    // 3. Test avec période de 2 jours (hier + aujourd'hui)
    console.log('\n3️⃣ TEST API REPORTS (2 jours)');
    
    const twoDaysResponse = await fetch('https://alamigestion-production.up.railway.app/api/dashboard/stats?days=2');
    
    if (twoDaysResponse.ok) {
      const twoDaysData = await twoDaysResponse.json();
      
      console.log(`📊 Top produits (2 jours): ${twoDaysData.topProducts?.length || 0}`);
      
      if (twoDaysData.topProducts && twoDaysData.topProducts.length > 0) {
        console.log('\n🏆 TOP PRODUITS (2 JOURS):');
        twoDaysData.topProducts.forEach((product, index) => {
          const isCharnir = product.name.toLowerCase().includes('charnir');
          const marker = isCharnir ? '🎯' : '  ';
          
          console.log(`${marker} ${index + 1}. ${product.name} (${product.sku})`);
          console.log(`      Quantité: ${product.quantity} unités`);
          console.log(`      Total: ${product.total} DH`);
        });
        
        // Chercher Charnir 3D
        const charniRProduct = twoDaysData.topProducts.find(p => 
          p.name.toLowerCase().includes('charnir') || 
          p.sku === '000'
        );
        
        if (charniRProduct) {
          console.log(`\n🎯 "Charnir 3D" TROUVÉ dans le top ${twoDaysData.topProducts.indexOf(charniRProduct) + 1} (2 jours)!`);
          console.log(`   Quantité: ${charniRProduct.quantity} unités`);
          console.log(`   Total: ${charniRProduct.total} DH`);
        } else {
          console.log('\n❌ "Charnir 3D" NON TROUVÉ dans le top 5 (2 jours)');
        }
      }
    }

    // 4. Afficher les données de ventes par jour
    if (reportsData.salesByDay && reportsData.salesByDay.length > 0) {
      console.log('\n4️⃣ VENTES PAR JOUR:');
      reportsData.salesByDay.forEach(day => {
        console.log(`   ${day.date}: ${day.total} DH (${day.count} ventes)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testProductionAPI();
