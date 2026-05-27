import { TextField, InputAdornment, Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { transitions } from "../../theme/motion";

/**
 * Enhanced Form Input with Real-time Validation
 * Shows inline success/error states with smooth animations
 */

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export default function ValidatedInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  success,
  type = "text",
  placeholder,
  helperText,
  required,
  disabled,
  multiline,
  rows,
}: ValidatedInputProps) {
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError && value.length > 0;

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        error={hasError}
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        InputProps={{
          endAdornment: (value.length > 0 || hasError) && (
            <InputAdornment position="end">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  animation: "fadeIn 0.2s ease",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "scale(0.8)" },
                    to: { opacity: 1, transform: "scale(1)" },
                  },
                }}
              >
                {hasSuccess && (
                  <CheckCircleOutlineIcon
                    sx={{
                      color: "#10B981",
                      fontSize: 20,
                    }}
                  />
                )}
                {hasError && (
                  <ErrorOutlineIcon
                    sx={{
                      color: "#DC2626",
                      fontSize: 20,
                    }}
                  />
                )}
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            transition: transitions.input.focus,
            ...(hasSuccess && {
              "& fieldset": {
                borderColor: "#10B981",
              },
              "&:hover fieldset": {
                borderColor: "#10B981",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#10B981",
                borderWidth: 2,
              },
            }),
            ...(hasError && {
              "& fieldset": {
                borderColor: "#DC2626",
              },
              "&:hover fieldset": {
                borderColor: "#DC2626",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#DC2626",
                borderWidth: 2,
              },
            }),
          },
          "& .MuiInputLabel-root": {
            ...(hasSuccess && {
              color: "#10B981",
              "&.Mui-focused": {
                color: "#10B981",
              },
            }),
          },
        }}
      />

      {/* Helper or Error Text */}
      {(error || helperText) && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            ml: 1.5,
            color: hasError ? "#DC2626" : "#858D96",
            animation: "slideDown 0.2s ease",
            "@keyframes slideDown": {
              from: { opacity: 0, transform: "translateY(-4px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Password Strength Indicator
 * Shows visual feedback for password complexity
 */

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Weak", color: "#DC2626" };
    if (score <= 3) return { level: 2, label: "Fair", color: "#F59E0B" };
    if (score <= 4) return { level: 3, label: "Good", color: "#10B981" };
    return { level: 4, label: "Strong", color: "#059669" };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
        {[1, 2, 3, 4].map((level) => (
          <Box
            key={level}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 1,
              bgcolor: level <= strength.level ? strength.color : "#E9ECEF",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: strength.color,
          fontWeight: 600,
          ml: 0.5,
        }}
      >
        Password strength: {strength.label}
      </Typography>
    </Box>
  );
}
