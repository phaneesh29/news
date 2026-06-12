import { searchNewsParallel, deduplicateAndRank } from './tools/newsTools.js';
import { saveNews } from './tools/saveNews.js';
import { sendNewsEmail } from './tools/emailTools.js';

const run = async () => {
    console.log('🚀 Starting Programmatic News Agent Pipeline...\n');
    const startTime = Date.now();

    try {
        console.log('🔍 Executing Unified Search...');
        const searchStart = Date.now();
        const searchResult = await searchNewsParallel.execute({}, {});
        console.log(`  ⏱️ Search completed in ${((Date.now() - searchStart) / 1000).toFixed(1)}s`);

        console.log('🔄 Running Deduplication & Ranking...');
        const rankStart = Date.now();
        const rankResult = await deduplicateAndRank.execute({
            mergedSummary: searchResult.mergedSummary,
            mergedSources: searchResult.mergedSources,
        }, {});
        console.log(`  ⏱️ Deduplication & Ranking completed in ${((Date.now() - rankStart) / 1000).toFixed(1)}s`);

        console.log('💾 Saving news to news.md...');
        const saveStart = Date.now();
        const saveResult = await saveNews.execute({
            content: rankResult.rankedSummary,
            tldr: rankResult.tldr,
            trends: rankResult.trends,
            stats: rankResult.verificationStats,
        });

        if (saveResult.error) {
            throw new Error(`Failed to save news: ${saveResult.error}`);
        }
        console.log(`  ⏱️ Saving completed in ${((Date.now() - saveStart) / 1000).toFixed(1)}s`);

        console.log('📧 Distributing email digest...');
        const emailStart = Date.now();
        const emailResult = await sendNewsEmail.execute({});
        if (emailResult.error) {
            throw new Error(`Failed to send email: ${emailResult.error}`);
        }
        console.log(`  ⏱️ Email completed in ${((Date.now() - emailStart) / 1000).toFixed(1)}s`);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Pipeline complete in ${elapsed}s`);
        console.log('\n--- PIPELINE RUN SUMMARY ---');
        console.log(`📅 Execution Time: ${saveResult.lastFlowExecution}`);
        console.log(`📚 Unique News Items: ${rankResult.totalItems} (Merged: ${rankResult.duplicatesRemoved})`);
        
        if (rankResult.verificationStats) {
            const stats = rankResult.verificationStats;
            console.log(`📊 Verification stats: ${stats.highConfidenceCount} High, ${stats.mediumConfidenceCount} Medium, ${stats.lowConfidenceCount} Low confidence items`);
        }
        
        if (rankResult.tldr) {
            console.log('\n📋 TL;DR:\n', rankResult.tldr);
        }
        
        if (rankResult.trends && rankResult.trends.length > 0) {
            console.log('\n📈 Trends Detected:');
            rankResult.trends.forEach(trend => console.log(`  - ${trend}`));
        }
        
        console.log(`\n📧 Email sent successfully to whitelisted recipients.`);
    } catch (err) {
        console.error('\n❌ Pipeline execution failed:', err);
        process.exit(1);
    }
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

