import { useRef } from "react";
import { motion } from "framer-motion";
import { Camera, X, ImagePlus } from "lucide-react";

interface ProgressPhotoUploadProps {
  frontPhoto: string | null;
  sidePhoto: string | null;
  onFrontPhotoChange: (photo: string | null) => void;
  onSidePhotoChange: (photo: string | null) => void;
}

const ProgressPhotoUpload = ({
  frontPhoto,
  sidePhoto,
  onFrontPhotoChange,
  onSidePhotoChange,
}: ProgressPhotoUploadProps) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (photo: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-xl font-bold text-foreground mb-2">
        Sube tus fotos de hoy
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Mantén la consistencia para mejores resultados.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Front Photo */}
        <PhotoUploadBox
          label="FRONTAL"
          photo={frontPhoto}
          inputRef={frontInputRef}
          onFileChange={(e) => handleFileChange(e, onFrontPhotoChange)}
          onRemove={() => onFrontPhotoChange(null)}
        />

        {/* Side Photo */}
        <PhotoUploadBox
          label="LATERAL"
          photo={sidePhoto}
          inputRef={sideInputRef}
          onFileChange={(e) => handleFileChange(e, onSidePhotoChange)}
          onRemove={() => onSidePhotoChange(null)}
        />
      </div>
    </motion.div>
  );
};

interface PhotoUploadBoxProps {
  label: string;
  photo: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const PhotoUploadBox = ({
  label,
  photo,
  inputRef,
  onFileChange,
  onRemove,
}: PhotoUploadBoxProps) => {
  return (
    <motion.div
      className="relative aspect-square rounded-2xl overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />

      {photo ? (
        <div className="relative w-full h-full">
          <img
            src={photo}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Label */}
          <span className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase tracking-wider">
            {label}
          </span>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-dashed border-primary/50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-primary"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {label}
          </span>
        </button>
      )}
    </motion.div>
  );
};

export default ProgressPhotoUpload;
