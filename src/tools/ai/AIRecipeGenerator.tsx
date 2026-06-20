import { useState } from 'react';
import { ChefHat, Loader2, Copy, Check, Download, Sparkles, ShoppingCart, Plus, X } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type Diet = 'none' | 'vegetarian' | 'vegan' | 'keto' | 'gluten-free' | 'dairy-free';
type Cuisine = 'any' | 'italian' | 'asian' | 'mexican' | 'mediterranean' | 'indian' | 'american' | 'french';

interface SavedRecipe { name: string; recipe: string; timestamp: string }

export const AIRecipeGeneratorTool = () => {
  const [ingredients, setIngredients] = useState<string[]>(['chicken breast', 'garlic', 'lemon', 'olive oil', 'rosemary']);
  const [newIngredient, setNewIngredient] = useState('');
  const [cuisine, setCuisine] = useState<Cuisine>('any');
  const [diet, setDiet] = useState<Diet>('none');
  const [servings, setServings] = useState(2);
  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [nutrition, setNutrition] = useState('');
  const [shoppingList, setShoppingList] = useState('');
  const [variants, setVariants] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<'recipe' | 'nutrition' | 'shopping' | 'variants'>('recipe');
  const [showSaved, setShowSaved] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a professional chef and nutritionist. Create practical, delicious recipes with clear instructions and accurate nutrition estimates.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim().toLowerCase())) {
      setIngredients(prev => [...prev, newIngredient.trim().toLowerCase()]);
      setNewIngredient('');
    }
  };
  const removeIngredient = (i: string) => setIngredients(prev => prev.filter(x => x !== i));

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setStatusMsg('Creating your recipe...');
    try {
      const dietNote = diet !== 'none' ? ` Diet: ${diet}.` : '';
      const cuisineNote = cuisine !== 'any' ? ` Cuisine: ${cuisine}.` : '';
      const result = await aiService.generateText(
        `Create a complete recipe using these ingredients: ${ingredients.join(', ')}.${cuisineNote}${dietNote} Serves ${servings}.\nReturn JSON: {"name":"...","ingredients":["..."],"steps":["..."],"prepTime":"...","cookTime":"..."}`,
        600,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setRecipeName(parsed.name || 'Your Recipe');
        const formatted = `🍽️ ${parsed.name}\n⏱️ Prep: ${parsed.prepTime} | Cook: ${parsed.cookTime}\n\n📋 Ingredients:\n${parsed.ingredients?.map((i: string) => `• ${i}`).join('\n')}\n\n👨‍🍳 Instructions:\n${parsed.steps?.map((s: string, idx: number) => `${idx+1}. ${s}`).join('\n')}`;
        setGeneratedRecipe(formatted);
      } else {
        setGeneratedRecipe(result);
        setRecipeName('Your Recipe');
      }
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateNutrition = async () => {
    if (!generatedRecipe) return;
    setLoading(true);
    setStatusMsg('Estimating nutrition...');
    try {
      const result = await aiService.generateText(
        `Estimate the nutrition per serving for this recipe (serves ${servings}). Format as: Calories, Protein, Carbs, Fat, Fiber, Sodium.\n\nRecipe: ${generatedRecipe.slice(0, 500)}`,
        200,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.2 }
      );
      setNutrition(result);
      setActiveTab('nutrition');
    } catch { setNutrition('Error estimating nutrition.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateShoppingList = async () => {
    if (!generatedRecipe) return;
    setLoading(true);
    setStatusMsg('Creating shopping list...');
    try {
      const result = await aiService.generateText(
        `From this recipe, identify any missing ingredients beyond these on-hand items: ${ingredients.join(', ')}.\nCreate a shopping list with estimated quantities. Recipe:\n${generatedRecipe.slice(0, 500)}`,
        200,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.3 }
      );
      setShoppingList(result);
      setActiveTab('shopping');
    } catch { setShoppingList('Error generating list.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateVariants = async () => {
    if (!recipeName) return;
    setLoading(true);
    setStatusMsg('Generating variations...');
    try {
      const result = await aiService.generateText(
        `Suggest 3 delicious variations of "${recipeName}". For each: different protein/vegetable swap, flavor profile change, or cooking method. Be creative.`,
        300,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.8 }
      );
      setVariants(result);
      setActiveTab('variants');
    } catch { setVariants('Error generating variants.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const saveRecipe = () => {
    if (!generatedRecipe) return;
    setSavedRecipes(prev => [{ name: recipeName, recipe: generatedRecipe, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
  };

  const exportRecipe = () => {
    const content = `${recipeName}\n\n${generatedRecipe}\n\n--- NUTRITION ---\n${nutrition}\n\n--- SHOPPING LIST ---\n${shoppingList}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${recipeName || 'recipe'}.txt`;
    a.click();
  };

  const tabContent = { recipe: generatedRecipe, nutrition, shopping: shoppingList, variants };

  const cuisineEmoji: Record<Cuisine, string> = { any: '🌍', italian: '🍝', asian: '🍜', mexican: '🌮', mediterranean: '🫒', indian: '🍛', american: '🍔', french: '🥐' };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Config */}
        <div className="flex flex-col gap-3">
          {/* Ingredients */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Ingredients</label>
            <div className="flex gap-2">
              <input value={newIngredient} onChange={e => setNewIngredient(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIngredient()}
                placeholder="Add ingredient..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500" />
              <button onClick={addIngredient} className="p-2 bg-orange-700 hover:bg-orange-600 text-white rounded-xl transition-all">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map(i => (
                <span key={i} className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs">
                  {i} <button onClick={() => removeIngredient(i)} className="text-slate-500 hover:text-red-400 transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cuisine</label>
            <div className="grid grid-cols-4 gap-1">
              {(['any', 'italian', 'asian', 'mexican', 'mediterranean', 'indian', 'american', 'french'] as Cuisine[]).map(c => (
                <button key={c} onClick={() => setCuisine(c)}
                  className={`py-2 rounded-lg text-[10px] font-semibold text-center transition-all border ${cuisine === c ? 'bg-orange-700 border-orange-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  {cuisineEmoji[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Diet & Servings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Diet</label>
              <select value={diet} onChange={e => setDiet(e.target.value as Diet)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500">
                {(['none', 'vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free'] as Diet[]).map(d => (
                  <option key={d} value={d}>{d === 'none' ? 'No restriction' : d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Servings</span><span className="text-orange-400 font-mono">{servings}</span>
              </label>
              <input type="range" min={1} max={10} value={servings} onChange={e => setServings(+e.target.value)}
                className="w-full accent-orange-500 mt-1" />
            </div>
          </div>

          <button onClick={generateRecipe} disabled={loading || ingredients.length === 0}
            className="flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><ChefHat size={15} /><span>Generate Recipe</span></>}
          </button>

          {generatedRecipe && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={generateNutrition} className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all">
                  <Sparkles size={11} /> Nutrition
                </button>
                <button onClick={generateShoppingList} className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all">
                  <ShoppingCart size={11} /> Shopping
                </button>
                <button onClick={generateVariants} className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all">
                  <ChefHat size={11} /> Variants
                </button>
              </div>
              <div className="flex gap-1.5">
                <button onClick={saveRecipe} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all">💾 Save</button>
                <button onClick={exportRecipe} className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all">
                  <Download size={11} /> Export
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3">
          {generatedRecipe && (
            <>
              <div className="flex gap-1.5">
                {(['recipe', 'nutrition', 'shopping', 'variants'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${activeTab === t ? 'bg-orange-700 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-64 max-h-[28rem] bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap overflow-auto">
                {tabContent[activeTab] || <span className="text-slate-600">Click the button above to generate {activeTab}...</span>}
              </div>
              <button onClick={() => handleTextCopy(tabContent[activeTab], setCopied)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
              </button>
            </>
          )}

          {savedRecipes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <button onClick={() => setShowSaved(!showSaved)} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left hover:text-slate-400">
                📚 Saved Recipes ({savedRecipes.length})
              </button>
              {showSaved && savedRecipes.map((r, i) => (
                <button key={i} onClick={() => { setGeneratedRecipe(r.recipe); setRecipeName(r.name); setActiveTab('recipe'); }}
                  className="text-left p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 transition-all">
                  <span className="text-orange-400">[{r.timestamp}]</span> {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
