/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Summary from '@/models/Summary';

// Helper function to extract key words and their frequencies
function extractWordFrequencies(texts: string[]): Record<string, number> {
  const wordCounts: Record<string, number> = {};
  
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'it', 'he', 'she', 'they', 'we', 'you', 'i', 'me', 'him', 'her', 'them', 'us', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'from', 'up', 'about', 'into', 'over', 'after', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'if', 'because', 'as', 'until', 'while', 'during', 'before', 'after', 'above', 'below', 'between', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
  ]);
  
  texts.forEach(text => {
    // Clean and tokenize text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) && // exclude pure numbers
        !/^[a-z]{1,2}$/.test(word) // exclude very short words
      );
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });
  
  return wordCounts;
}

// Simple sentiment analysis
function analyzeSentiment(text: string): { score: number; label: string; confidence: number } {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect', 'outstanding', 'brilliant', 'superb', 'magnificent', 'marvelous', 'terrific', 'fabulous', 'incredible', 'remarkable', 'exceptional', 'impressive', 'successful', 'effective', 'efficient', 'beneficial', 'valuable', 'useful', 'helpful', 'positive', 'optimistic', 'pleased', 'satisfied', 'happy', 'delighted', 'thrilled', 'excited', 'enthusiastic', 'confident', 'strong', 'solid', 'robust', 'reliable', 'trustworthy', 'professional', 'quality', 'premium', 'superior', 'advanced', 'innovative', 'creative', 'smart', 'intelligent', 'clear', 'comprehensive', 'detailed', 'thorough', 'complete', 'accurate', 'precise', 'timely', 'prompt', 'fast', 'quick', 'smooth', 'easy', 'simple', 'convenient', 'comfortable', 'safe', 'secure', 'stable', 'growth', 'profit', 'revenue', 'increase', 'improve', 'enhance', 'upgrade', 'optimize', 'maximize', 'achieve', 'accomplish', 'succeed', 'win', 'gain', 'benefit', 'advantage', 'opportunity', 'solution', 'resolve', 'fix', 'repair', 'restore', 'recover', 'progress', 'advance', 'develop', 'expand', 'build', 'create', 'establish', 'launch', 'introduce', 'implement', 'execute', 'deliver', 'provide', 'offer', 'support', 'assist', 'help', 'serve', 'satisfy', 'meet', 'exceed', 'surpass', 'outperform', 'lead', 'pioneer', 'innovate', 'transform', 'revolutionize', 'modernize', 'streamline', 'simplify', 'clarify', 'organize', 'structure', 'plan', 'prepare', 'ready', 'available', 'accessible', 'open', 'transparent', 'honest', 'fair', 'reasonable', 'affordable', 'cost-effective', 'economical', 'budget-friendly', 'value', 'worth', 'merit', 'deserve', 'earn', 'reward', 'recognize', 'appreciate', 'thank', 'congratulate', 'celebrate', 'honor', 'respect', 'admire', 'praise', 'compliment', 'recommend', 'endorse', 'approve', 'accept', 'agree', 'confirm', 'verify', 'validate', 'certify', 'guarantee', 'assure', 'promise', 'commit', 'dedicate', 'focus', 'concentrate', 'prioritize', 'emphasize', 'highlight', 'feature', 'showcase', 'demonstrate', 'prove', 'show', 'reveal', 'discover', 'find', 'identify', 'recognize', 'realize', 'understand', 'comprehend', 'grasp', 'learn', 'know', 'master', 'expert', 'skilled', 'talented', 'capable', 'competent', 'qualified', 'experienced', 'knowledgeable', 'informed', 'aware', 'conscious', 'mindful', 'careful', 'attentive', 'focused', 'dedicated', 'committed', 'loyal', 'faithful', 'devoted', 'passionate', 'enthusiastic', 'motivated', 'inspired', 'encouraged', 'supported', 'backed', 'endorsed', 'recommended', 'preferred', 'chosen', 'selected', 'picked', 'favored', 'liked', 'loved', 'adored', 'cherished', 'treasured', 'valued', 'prized', 'honored', 'respected', 'admired', 'appreciated', 'grateful', 'thankful', 'blessed', 'fortunate', 'lucky', 'successful', 'prosperous', 'thriving', 'flourishing', 'booming', 'growing', 'expanding', 'developing', 'progressing', 'advancing', 'improving', 'enhancing', 'upgrading', 'optimizing', 'maximizing', 'increasing', 'rising', 'climbing', 'soaring', 'skyrocketing', 'surging', 'spiking', 'jumping', 'leaping', 'bouncing', 'recovering', 'rebounding', 'returning', 'restoring', 'reviving', 'renewing', 'refreshing', 'rejuvenating', 'revitalizing', 'energizing', 'invigorating', 'stimulating', 'motivating', 'inspiring', 'encouraging', 'uplifting', 'boosting', 'strengthening', 'empowering', 'enabling', 'facilitating', 'supporting', 'assisting', 'helping', 'serving', 'providing', 'offering', 'delivering', 'supplying', 'furnishing', 'equipping', 'preparing', 'readying', 'organizing', 'arranging', 'planning', 'designing', 'creating', 'building', 'constructing', 'developing', 'establishing', 'founding', 'launching', 'introducing', 'implementing', 'executing', 'performing', 'achieving', 'accomplishing', 'completing', 'finishing', 'concluding', 'ending', 'closing', 'wrapping', 'finalizing', 'securing', 'obtaining', 'acquiring', 'gaining', 'earning', 'winning', 'capturing', 'seizing', 'grasping', 'holding', 'maintaining', 'keeping', 'preserving', 'protecting', 'safeguarding', 'defending', 'shielding', 'covering', 'insuring', 'ensuring', 'guaranteeing', 'promising', 'committing', 'pledging', 'vowing', 'swearing', 'declaring', 'stating', 'announcing', 'proclaiming', 'revealing', 'disclosing', 'sharing', 'communicating', 'expressing', 'conveying', 'transmitting', 'delivering', 'presenting', 'showing', 'displaying', 'exhibiting', 'demonstrating', 'illustrating', 'explaining', 'clarifying', 'describing', 'detailing', 'outlining', 'summarizing', 'highlighting', 'emphasizing', 'stressing', 'underscoring', 'accentuating', 'featuring', 'showcasing', 'promoting', 'advertising', 'marketing', 'selling', 'offering', 'providing', 'supplying', 'delivering', 'serving', 'catering', 'accommodating', 'satisfying', 'fulfilling', 'meeting', 'exceeding', 'surpassing', 'outperforming', 'outdoing', 'beating', 'defeating', 'conquering', 'overcoming', 'surmounting', 'transcending', 'rising', 'ascending', 'climbing', 'scaling', 'reaching', 'attaining', 'achieving', 'realizing', 'fulfilling', 'completing', 'accomplishing', 'succeeding', 'triumphing', 'prevailing', 'winning', 'victorious', 'champion', 'leader', 'pioneer', 'innovator', 'creator', 'founder', 'builder', 'developer', 'designer', 'architect', 'engineer', 'scientist', 'researcher', 'analyst', 'expert', 'specialist', 'professional', 'authority', 'master', 'guru', 'wizard', 'genius', 'brilliant', 'smart', 'intelligent', 'clever', 'wise', 'knowledgeable', 'informed', 'educated', 'learned', 'scholarly', 'academic', 'intellectual', 'thoughtful', 'insightful', 'perceptive', 'observant', 'aware', 'conscious', 'mindful', 'attentive', 'alert', 'vigilant', 'watchful', 'careful', 'cautious', 'prudent', 'sensible', 'reasonable', 'rational', 'logical', 'practical', 'realistic', 'pragmatic', 'down-to-earth', 'grounded', 'stable', 'steady', 'consistent', 'reliable', 'dependable', 'trustworthy', 'honest', 'truthful', 'sincere', 'genuine', 'authentic', 'real', 'actual', 'factual', 'accurate', 'precise', 'exact', 'correct', 'right', 'proper', 'appropriate', 'suitable', 'fitting', 'perfect', 'ideal', 'optimal', 'best', 'top', 'superior', 'premium', 'high-quality', 'excellent', 'outstanding', 'exceptional', 'remarkable', 'extraordinary', 'amazing', 'incredible', 'fantastic', 'wonderful', 'marvelous', 'magnificent', 'superb', 'brilliant', 'awesome', 'terrific', 'fabulous', 'spectacular', 'stunning', 'breathtaking', 'impressive', 'striking', 'notable', 'noteworthy', 'significant', 'important', 'valuable', 'precious', 'priceless', 'invaluable', 'worthwhile', 'beneficial', 'advantageous', 'profitable', 'lucrative', 'rewarding', 'fruitful', 'productive', 'effective', 'efficient', 'successful', 'prosperous', 'thriving', 'flourishing', 'booming', 'growing', 'expanding', 'developing', 'progressing', 'advancing', 'improving', 'enhancing', 'upgrading', 'optimizing', 'maximizing', 'increasing', 'rising', 'climbing', 'soaring', 'skyrocketing', 'surging', 'spiking', 'jumping', 'leaping', 'bouncing', 'recovering', 'rebounding', 'returning', 'restoring', 'reviving', 'renewing', 'refreshing', 'rejuvenating', 'revitalizing', 'energizing', 'invigorating', 'stimulating', 'motivating', 'inspiring', 'encouraging', 'uplifting', 'boosting', 'strengthening', 'empowering', 'enabling', 'facilitating', 'supporting', 'assisting', 'helping', 'serving', 'providing', 'offering', 'delivering', 'supplying', 'furnishing', 'equipping', 'preparing', 'readying', 'organizing', 'arranging', 'planning', 'designing', 'creating', 'building', 'constructing', 'developing', 'establishing', 'founding', 'launching', 'introducing', 'implementing', 'executing', 'performing', 'achieving', 'accomplishing', 'completing', 'finishing', 'concluding', 'ending', 'closing', 'wrapping', 'finalizing', 'securing', 'obtaining', 'acquiring', 'gaining', 'earning', 'winning', 'capturing', 'seizing', 'grasping', 'holding', 'maintaining', 'keeping', 'preserving', 'protecting', 'safeguarding', 'defending', 'shielding', 'covering', 'insuring', 'ensuring', 'guaranteeing', 'promising', 'committing', 'pledging', 'vowing', 'swearing', 'declaring', 'stating', 'announcing', 'proclaiming', 'revealing', 'disclosing', 'sharing', 'communicating', 'expressing', 'conveying', 'transmitting', 'delivering', 'presenting', 'showing', 'displaying', 'exhibiting', 'demonstrating', 'illustrating', 'explaining', 'clarifying', 'describing', 'detailing', 'outlining', 'summarizing', 'highlighting', 'emphasizing', 'stressing', 'underscoring', 'accentuating', 'featuring', 'showcasing', 'promoting', 'advertising', 'marketing', 'selling', 'offering', 'providing', 'supplying', 'delivering', 'serving', 'catering', 'accommodating', 'satisfying', 'fulfilling', 'meeting', 'exceeding', 'surpassing', 'outperforming', 'outdoing', 'beating', 'defeating', 'conquering', 'overcoming', 'surmounting', 'transcending', 'rising', 'ascending', 'climbing', 'scaling', 'reaching', 'attaining', 'achieving', 'realizing', 'fulfilling', 'completing', 'accomplishing', 'succeeding', 'triumphing', 'prevailing', 'winning'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'nasty', 'gross', 'ugly', 'hideous', 'repulsive', 'revolting', 'appalling', 'shocking', 'disturbing', 'alarming', 'concerning', 'worrying', 'troubling', 'problematic', 'difficult', 'challenging', 'hard', 'tough', 'rough', 'harsh', 'severe', 'serious', 'critical', 'dangerous', 'risky', 'unsafe', 'insecure', 'unstable', 'unreliable', 'untrustworthy', 'dishonest', 'false', 'fake', 'fraudulent', 'deceptive', 'misleading', 'confusing', 'unclear', 'ambiguous', 'vague', 'incomplete', 'insufficient', 'inadequate', 'poor', 'low', 'inferior', 'substandard', 'mediocre', 'average', 'ordinary', 'common', 'typical', 'normal', 'regular', 'standard', 'basic', 'simple', 'plain', 'boring', 'dull', 'tedious', 'monotonous', 'repetitive', 'routine', 'mundane', 'ordinary', 'uninteresting', 'unexciting', 'uninspiring', 'unmotivating', 'discouraging', 'disappointing', 'frustrating', 'annoying', 'irritating', 'aggravating', 'bothersome', 'troublesome', 'problematic', 'difficult', 'challenging', 'hard', 'tough', 'rough', 'harsh', 'severe', 'serious', 'critical', 'dangerous', 'risky', 'unsafe', 'insecure', 'unstable', 'unreliable', 'untrustworthy', 'dishonest', 'false', 'fake', 'fraudulent', 'deceptive', 'misleading', 'confusing', 'unclear', 'ambiguous', 'vague', 'incomplete', 'insufficient', 'inadequate', 'poor', 'low', 'inferior', 'substandard', 'mediocre', 'fail', 'failure', 'failed', 'failing', 'unsuccessful', 'lose', 'loss', 'lost', 'losing', 'defeat', 'beaten', 'wrong', 'incorrect', 'mistake', 'error', 'fault', 'flaw', 'defect', 'problem', 'issue', 'trouble', 'difficulty', 'challenge', 'obstacle', 'barrier', 'hindrance', 'impediment', 'setback', 'delay', 'postpone', 'cancel', 'reject', 'refuse', 'deny', 'decline', 'disapprove', 'disagree', 'oppose', 'resist', 'fight', 'argue', 'dispute', 'conflict', 'clash', 'compete', 'rival', 'enemy', 'opponent', 'adversary', 'competitor', 'threat', 'risk', 'danger', 'hazard', 'peril', 'jeopardy', 'vulnerability', 'weakness', 'shortcoming', 'limitation', 'restriction', 'constraint', 'boundary', 'limit', 'cap', 'ceiling', 'maximum', 'minimum', 'least', 'worst', 'bottom', 'low', 'down', 'decrease', 'decline', 'drop', 'fall', 'plummet', 'crash', 'collapse', 'break', 'shatter', 'destroy', 'damage', 'harm', 'hurt', 'injure', 'wound', 'pain', 'suffer', 'struggle', 'fight', 'battle', 'war', 'conflict', 'dispute', 'argument', 'disagreement', 'misunderstanding', 'confusion', 'chaos', 'disorder', 'mess', 'clutter', 'disorganization', 'inefficiency', 'waste', 'loss', 'deficit', 'shortage', 'lack', 'absence', 'missing', 'gone', 'lost', 'disappeared', 'vanished', 'extinct', 'dead', 'died', 'death', 'kill', 'murder', 'assassinate', 'execute', 'eliminate', 'remove', 'delete', 'erase', 'wipe', 'clean', 'clear', 'empty', 'vacant', 'blank', 'void', 'null', 'nothing', 'none', 'zero', 'negative', 'minus', 'less', 'fewer', 'smaller', 'shorter', 'lower', 'weaker', 'slower', 'later', 'behind', 'back', 'backward', 'reverse', 'opposite', 'contrary', 'against', 'anti', 'counter'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) positiveCount++;
    if (negativeWords.includes(cleanWord)) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) {
    return { score: 0, label: 'Neutral', confidence: 0 };
  }
  
  const score = (positiveCount - negativeCount) / totalSentimentWords;
  const confidence = Math.min(totalSentimentWords / words.length * 10, 1); // Confidence based on sentiment word density
  
  let label = 'Neutral';
  if (score > 0.1) label = 'Positive';
  else if (score < -0.1) label = 'Negative';
  
  return { score, label, confidence };
}

// Extract key entities and topics
async function extractKeyInsights(summaries: any[]): Promise<any> {
  try {
    const nlp = (await import('compromise')).default;
    
    const allText = summaries.map(s => s.summary).join(' ');
    const doc = nlp(allText);
    
    // Extract entities
    const people = doc.people().out('array').slice(0, 10);
    const places = doc.places().out('array').slice(0, 10);
    const organizations = doc.organizations().out('array').slice(0, 10);
    const topics = doc.topics().out('array').slice(0, 15);
    
    // Calculate average text length
    const avgTextLength = summaries.reduce((sum, s) => sum + (s.summary?.length || 0), 0) / summaries.length;
    
    // Most common document types
    const documentTypes: Record<string, number> = {};
    summaries.forEach(s => {
      const type = s.documentType || 'Other';
      documentTypes[type] = (documentTypes[type] || 0) + 1;
    });
    
    return {
      entities: {
        people: people.filter((p: string) => p.length > 2),
        places: places.filter((p: string) => p.length > 2),
        organizations: organizations.filter((o: string) => o.length > 2),
        topics: topics.filter((t: string) => t.length > 2)
      },
      metrics: {
        totalDocuments: summaries.length,
        avgTextLength: Math.round(avgTextLength),
        documentTypes: Object.entries(documentTypes)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }
    };
  } catch (error) {
    console.error('Error extracting insights:', error);
    return {
      entities: { people: [], places: [], organizations: [], topics: [] },
      metrics: { totalDocuments: 0, avgTextLength: 0, documentTypes: [] }
    };
  }
}

export async function GET() {
  try {
    console.log('GET /api/insights - Generating summary insights...');
    
    await connectToDatabase();
    
    // Fetch all summaries
    const summaries = await Summary.find().sort({ createdAt: -1 }).limit(200);
    
    if (summaries.length === 0) {
      return NextResponse.json({
        wordCloud: [],
        sentiment: { overall: 'Neutral', distribution: { Positive: 0, Neutral: 0, Negative: 0 } },
        insights: {
          entities: { people: [], places: [], organizations: [], topics: [] },
          metrics: { totalDocuments: 0, avgTextLength: 0, documentTypes: [] }
        }
      });
    }
    
    console.log(`📊 Analyzing ${summaries.length} summaries for insights...`);
    
    // Extract word frequencies for word cloud
    const summaryTexts = summaries.map(s => s.summary || '');
    const wordFrequencies = extractWordFrequencies(summaryTexts);
    
    // Convert to word cloud format (top 50 words)
    const wordCloud = Object.entries(wordFrequencies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .map(([word, count]) => ({ text: word, value: count }));
    
    // Analyze sentiment for each summary
    const sentimentResults = summaryTexts.map(text => analyzeSentiment(text));
    
    // Calculate overall sentiment distribution
    const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    sentimentResults.forEach(result => {
      sentimentCounts[result.label as keyof typeof sentimentCounts]++;
    });
    
    const totalSentiments = sentimentResults.length;
    const sentimentDistribution = {
      Positive: Math.round((sentimentCounts.Positive / totalSentiments) * 100),
      Neutral: Math.round((sentimentCounts.Neutral / totalSentiments) * 100),
      Negative: Math.round((sentimentCounts.Negative / totalSentiments) * 100)
    };
    
    // Determine overall sentiment
    const overallSentiment = sentimentCounts.Positive > sentimentCounts.Negative ? 
      (sentimentCounts.Positive > sentimentCounts.Neutral ? 'Positive' : 'Neutral') :
      (sentimentCounts.Negative > sentimentCounts.Neutral ? 'Negative' : 'Neutral');
    
    // Extract key insights
    const insights = await extractKeyInsights(summaries);
    
    console.log(`✅ Generated insights: ${wordCloud.length} words, ${sentimentResults.length} sentiment analyses`);
    
    return NextResponse.json({
      wordCloud,
      sentiment: {
        overall: overallSentiment,
        distribution: sentimentDistribution,
        details: sentimentResults.map((result, index) => ({
          documentId: summaries[index]._id,
          fileName: summaries[index].fileName,
          sentiment: result.label,
          score: Math.round(result.score * 100) / 100,
          confidence: Math.round(result.confidence * 100) / 100
        }))
      },
      insights
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/insights] Error:', error);
    
    return NextResponse.json({
      error: 'Failed to generate insights: ' + errorMessage,
      wordCloud: [],
      sentiment: { overall: 'Neutral', distribution: { Positive: 0, Neutral: 0, Negative: 0 } },
      insights: {
        entities: { people: [], places: [], organizations: [], topics: [] },
        metrics: { totalDocuments: 0, avgTextLength: 0, documentTypes: [] }
      }
    }, { status: 500 });
  }
} 