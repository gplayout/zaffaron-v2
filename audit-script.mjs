import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'
import fs from 'fs'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function runAudit() {
  console.log('Starting Zaffaron Recipe Data Quality Audit...')
  
  // 1. Count recipes with empty/null descriptions, instructions, or ingredients
  const { data: emptyData, error: emptyError } = await supabase
    .from('recipes')
    .select('id')
    .or('description.is.null,description.eq.,instructions.is.null,instructions.eq.,ingredients.is.null,ingredients.eq.')
  
  if (emptyError) {
    console.error('Error counting empty fields:', emptyError)
  } else {
    console.log(`Recipes with empty/null descriptions/instructions/ingredients: ${emptyData.length}`)
  }
  
  // 2. Count recipes with broken image URLs
  const { data: brokenImageUrls, error: brokenImageError } = await supabase
    .from('recipes')
    .select('id')
    .or('image_url.is.null,image_url.eq.,image_url.eq.https://example.com/image.jpg')
  
  if (brokenImageError) {
    console.error('Error counting broken image URLs:', brokenImageError)
  } else {
    console.log(`Recipes with broken image URLs: ${brokenImageUrls.length}`)
  }
  
  // 3. Count recipes with Farsi/Arabic text outside of title parentheses
  const { data: arabicFarsiData, error: arabicFarsiError } = await supabase
    .from('recipes')
    .select('id, title, description, instructions, ingredients')
  
  if (arabicFarsiError) {
    console.error('Error fetching recipes for Arabic/Farsi check:', arabicFarsiError)
  } else {
    let arabicFarsiCount = 0
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/ // Arabic characters
    const farsiRegex = /[\u067E\u0686\u0698\u06A9\u06AF\u06CC]/ // Farsi characters
    
    for (const recipe of arabicFarsiData) {
      const title = recipe.title || ''
      const description = recipe.description || ''
      const instructions = recipe.instructions || ''
      const ingredients = recipe.ingredients || ''
      
      // Check if Arabic/Farsi characters appear outside parentheses in the title
      const titleWithoutParentheses = title.replace(/\([^)]*\)/g, '')
      if (arabicRegex.test(titleWithoutParentheses) || farsiRegex.test(titleWithoutParentheses)) {
        arabicFarsiCount++
      }
      
      // Check other fields for Arabic/Farsi characters
      if (arabicRegex.test(description) || farsiRegex.test(description) ||
          arabicRegex.test(instructions) || farsiRegex.test(instructions) ||
          arabicRegex.test(ingredients) || farsiRegex.test(ingredients)) {
        arabicFarsiCount++
      }
    }
    
    console.log(`Recipes with Farsi/Arabic text outside of title parentheses: ${arabicFarsiCount}`)
  }
  
  // 4. Count recipes with duplicate slugs
  const { data: slugData, error: slugError } = await supabase
    .from('recipes')
    .select('slug')
    .not('slug', 'is', null)
  
  if (slugError) {
    console.error('Error counting duplicate slugs:', slugError)
  } else {
    const slugCounts = {}
    for (const recipe of slugData) {
      slugCounts[recipe.slug] = (slugCounts[recipe.slug] || 0) + 1
    }
    
    const duplicateSlugs = Object.values(slugCounts).filter(count => count > 1).length
    console.log(`Recipes with duplicate slugs: ${duplicateSlugs}`)
  }
  
  // 5. Count recipes with unrealistic nutrition (calories < 10 or > 5000)
  const { data: nutritionData, error: nutritionError } = await supabase
    .from('recipes')
    .select('id,nutrition')
  
  if (nutritionError) {
    console.error('Error counting unrealistic nutrition:', nutritionError)
  } else {
    let unrealisticNutritionCount = 0
    
    for (const recipe of nutritionData) {
      if (recipe.nutrition && typeof recipe.nutrition === 'object' && recipe.nutrition.calories !== null) {
        const calories = recipe.nutrition.calories
        if (calories < 10 || calories > 5000) {
          unrealisticNutritionCount++
        }
      }
    }
    
    console.log(`Recipes with unrealistic nutrition (calories < 10 or > 5000): ${unrealisticNutritionCount}`)
  }
  
  // 6. Count recipes with empty tips, serve_with, or cultural_significance
  const { data: emptyFieldsData, error: emptyFieldsError } = await supabase
    .from('recipes')
    .select('id')
    .or('tips.is.null,tips.eq.,serve_with.is.null,serve_with.eq.,cultural_significance.is.null,cultural_significance.eq.')
  
  if (emptyFieldsError) {
    console.error('Error counting empty tips/serve_with/cultural_significance:', emptyFieldsError)
  } else {
    console.log(`Recipes with empty tips/serve_with/cultural_significance: ${emptyFieldsData.length}`)
  }
  
  // 7. Check for orphan records in recipeops_jobs
  const { data: orphanJobs, error: orphanError } = await supabase
    .from('recipeops_jobs')
    .select('id')
    .is('recipe_id', null)
  
  if (orphanError) {
    console.error('Error checking for orphan records in recipeops_jobs:', orphanError)
  } else {
    console.log(`Orphan records in recipeops_jobs: ${orphanJobs.length}`)
  }
  
  // 8. Distribution of category_slug and cuisine_slug
  const { data: categoryData, error: categoryError } = await supabase
    .from('recipes')
    .select('category_slug')
    .not('category_slug', 'is', null)
  
  if (categoryError) {
    console.error('Error getting category distribution:', categoryError)
  } else {
    const categoryCounts = {}
    for (const recipe of categoryData) {
      categoryCounts[recipe.category_slug] = (categoryCounts[recipe.category_slug] || 0) + 1
    }
    
    console.log('Category slug distribution:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
  }
  
  const { data: cuisineData, error: cuisineError } = await supabase
    .from('recipes')
    .select('cuisine_slug')
    .not('cuisine_slug', 'is', null)
  
  if (cuisineError) {
    console.error('Error getting cuisine distribution:', cuisineError)
  } else {
    const cuisineCounts = {}
    for (const recipe of cuisineData) {
      cuisineCounts[recipe.cuisine_slug] = (cuisineCounts[recipe.cuisine_slug] || 0) + 1
    }
    
    console.log('Cuisine slug distribution:')
    Object.entries(cuisineCounts).forEach(([cuisine, count]) => {
      console.log(`  ${cuisine}: ${count}`)
    })
  }
  
  // 9. Count recipes with published=false
  const { data: unpublishedData, error: unpublishedError } = await supabase
    .from('recipes')
    .select('id')
    .eq('published', false)
  
  if (unpublishedError) {
    console.error('Error counting unpublished recipes:', unpublishedError)
  } else {
    console.log(`Unpublished recipes: ${unpublishedData.length}`)
  }
  
  // 10. Check for duplicate recipe titles
  const { data: titleData, error: titleError } = await supabase
    .from('recipes')
    .select('title')
    .not('title', 'is', null)
  
  if (titleError) {
    console.error('Error counting duplicate titles:', titleError)
  } else {
    const titleCounts = {}
    for (const recipe of titleData) {
      titleCounts[recipe.title] = (titleCounts[recipe.title] || 0) + 1
    }
    
    const duplicateTitles = Object.values(titleCounts).filter(count => count > 1).length
    console.log(`Recipes with duplicate titles: ${duplicateTitles}`)
  }
  
  console.log('Audit complete.')
}

runAudit().catch(console.error)