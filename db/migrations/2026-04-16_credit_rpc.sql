-- Atomic credit decrement — prevents race conditions
-- Called BEFORE AI API call. If returns false, deny request.
CREATE OR REPLACE FUNCTION decrement_ai_credits(p_user_id UUID, p_cost INT DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_entitlements 
  SET ai_credits_remaining = ai_credits_remaining - p_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND ai_credits_remaining >= p_cost;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund on AI failure
CREATE OR REPLACE FUNCTION refund_ai_credits(p_user_id UUID, p_cost INT DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE user_entitlements 
  SET ai_credits_remaining = ai_credits_remaining + p_cost,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION decrement_ai_credits TO authenticated;
GRANT EXECUTE ON FUNCTION refund_ai_credits TO authenticated;
