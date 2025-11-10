import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { getChemicalWithSDS } from '@/data/chemicals';

const hazardColors = {
  Low: "#10B981",
  Moderate: "#F59E0B",
  High: "#F97316",
  Extreme: "#EF4444",
};

export default function ChemicalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const chemicalData = getChemicalWithSDS(id);

  if (!chemicalData) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? "#111B21" : "#FFFFFF" }}
      >
        <Text style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}>
          Chemical not found
        </Text>
      </View>
    );
  }

  const { sds } = chemicalData;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFFFFF", dark: "#111B21" }}
      headerImage={
        <LinearGradient
          colors={[
            hazardColors[chemicalData.hazardLevel],
            hazardColors[chemicalData.hazardLevel] + "80",
          ]}
          className="flex-1 justify-end p-6"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View>
            <Text className="text-3xl font-bold text-white mb-2">
              {chemicalData.name}
            </Text>
            <Text className="text-xl text-white opacity-90 mb-1">
              {chemicalData.formula}
            </Text>
            <Text className="text-base text-white opacity-80">
              CAS: {chemicalData.casNumber}
            </Text>
          </View>
        </LinearGradient>
      }
    >
      <View style={{ backgroundColor: isDark ? "#111B21" : "#FFFFFF" }}>
        {/* Section 1: Identification */}
        <SDSSection title="1. Identification" isDark={isDark}>
          <InfoRow
            label="Product Name"
            value={sds.productName}
            isDark={isDark}
          />
          <InfoRow
            label="Product Code"
            value={sds.productCode}
            isDark={isDark}
          />
          <InfoRow
            label="Manufacturer"
            value={sds.manufacturer}
            isDark={isDark}
          />
          <InfoRow
            label="Emergency Phone"
            value={sds.emergencyPhone}
            isDark={isDark}
          />
          <InfoRow
            label="Recommended Use"
            value={sds.recommendedUse}
            isDark={isDark}
          />
        </SDSSection>

        {/* Section 2: Hazard Identification */}
        <SDSSection title="2. Hazard Identification" isDark={isDark}>
          <View className="mb-4">
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: hazardColors[chemicalData.hazardLevel] }}
            >
              {sds.signalWord}
            </Text>
          </View>
          <SubSection title="Hazard Statements" isDark={isDark}>
            {sds.hazardStatements.map((statement, index) => (
              <BulletPoint key={index} text={statement} isDark={isDark} />
            ))}
          </SubSection>
          <SubSection title="Precautionary Statements" isDark={isDark}>
            {sds.precautionaryStatements.map((statement, index) => (
              <BulletPoint key={index} text={statement} isDark={isDark} />
            ))}
          </SubSection>
        </SDSSection>

        {/* Section 3: Composition */}
        <SDSSection
          title="3. Composition/Information on Ingredients"
          isDark={isDark}
        >
          {sds.components.map((component, index) => (
            <View
              key={index}
              className="mb-3 p-3 rounded-lg"
              style={{ backgroundColor: isDark ? "#1F2C34" : "#F7F9F9" }}
            >
              <Text
                className="font-semibold mb-1"
                style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
              >
                {component.name}
              </Text>
              <Text
                className="text-sm"
                style={{ color: isDark ? "#8696A0" : "#536471" }}
              >
                CAS: {component.casNumber}
              </Text>
              <Text
                className="text-sm"
                style={{ color: isDark ? "#8696A0" : "#536471" }}
              >
                Concentration: {component.concentration}
              </Text>
            </View>
          ))}
        </SDSSection>

        {/* Section 4: First Aid */}
        <SDSSection title="4. First Aid Measures" isDark={isDark}>
          <InfoRow
            label="Inhalation"
            value={sds.inhalation}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Skin Contact"
            value={sds.skinContact}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Eye Contact"
            value={sds.eyeContact}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Ingestion"
            value={sds.ingestion}
            isDark={isDark}
            multiline
          />
        </SDSSection>

        {/* Section 5: Fire Fighting */}
        <SDSSection title="5. Fire Fighting Measures" isDark={isDark}>
          <SubSection title="Suitable Extinguishing Media" isDark={isDark}>
            {sds.suitableExtinguishingMedia.map((media, index) => (
              <BulletPoint key={index} text={media} isDark={isDark} />
            ))}
          </SubSection>
          <SubSection title="Specific Hazards" isDark={isDark}>
            {sds.specificHazards.map((hazard, index) => (
              <BulletPoint key={index} text={hazard} isDark={isDark} />
            ))}
          </SubSection>
        </SDSSection>

        {/* Section 6: Accidental Release */}
        <SDSSection title="6. Accidental Release Measures" isDark={isDark}>
          <InfoRow
            label="Personal Precautions"
            value={sds.personalPrecautions}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Environmental Precautions"
            value={sds.environmentalPrecautions}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Cleanup Methods"
            value={sds.cleanupMethods}
            isDark={isDark}
            multiline
          />
        </SDSSection>

        {/* Section 7: Handling and Storage */}
        <SDSSection title="7. Handling and Storage" isDark={isDark}>
          <InfoRow
            label="Handling Precautions"
            value={sds.handlingPrecautions}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Storage Conditions"
            value={sds.storageConditions}
            isDark={isDark}
            multiline
          />
        </SDSSection>

        {/* Section 8: Exposure Controls */}
        <SDSSection
          title="8. Exposure Controls/Personal Protection"
          isDark={isDark}
        >
          <InfoRow
            label="Exposure Limits"
            value={sds.exposureLimits}
            isDark={isDark}
          />
          <InfoRow
            label="Engineering Controls"
            value={sds.engineeringControls}
            isDark={isDark}
            multiline
          />
          <SubSection title="Personal Protective Equipment" isDark={isDark}>
            <InfoRow
              label="Respiratory"
              value={sds.personalProtectiveEquipment.respiratory}
              isDark={isDark}
            />
            <InfoRow
              label="Hands"
              value={sds.personalProtectiveEquipment.hands}
              isDark={isDark}
            />
            <InfoRow
              label="Eyes"
              value={sds.personalProtectiveEquipment.eyes}
              isDark={isDark}
            />
            <InfoRow
              label="Skin"
              value={sds.personalProtectiveEquipment.skin}
              isDark={isDark}
            />
          </SubSection>
        </SDSSection>

        {/* Section 9: Physical and Chemical Properties */}
        <SDSSection title="9. Physical and Chemical Properties" isDark={isDark}>
          <View className="flex-row flex-wrap">
            <PropertyCard
              label="Appearance"
              value={sds.appearance}
              isDark={isDark}
            />
            <PropertyCard label="Odor" value={sds.odor} isDark={isDark} />
            <PropertyCard label="pH" value={sds.ph} isDark={isDark} />
            <PropertyCard
              label="Melting Point"
              value={sds.meltingPoint}
              isDark={isDark}
            />
            <PropertyCard
              label="Boiling Point"
              value={sds.boilingPoint}
              isDark={isDark}
            />
            <PropertyCard
              label="Flash Point"
              value={sds.flashPoint}
              isDark={isDark}
            />
            <PropertyCard label="Density" value={sds.density} isDark={isDark} />
            <PropertyCard
              label="Solubility"
              value={sds.solubility}
              isDark={isDark}
            />
          </View>
        </SDSSection>

        {/* Section 10: Stability and Reactivity */}
        <SDSSection title="10. Stability and Reactivity" isDark={isDark}>
          <InfoRow
            label="Chemical Stability"
            value={sds.chemicalStability}
            isDark={isDark}
          />
          <SubSection title="Incompatible Materials" isDark={isDark}>
            {sds.incompatibleMaterials.map((material, index) => (
              <BulletPoint key={index} text={material} isDark={isDark} />
            ))}
          </SubSection>
        </SDSSection>

        {/* Section 11: Toxicological Information */}
        <SDSSection title="11. Toxicological Information" isDark={isDark}>
          <InfoRow
            label="Acute Toxicity"
            value={sds.acuteToxicity}
            isDark={isDark}
          />
          <InfoRow
            label="Skin Corrosion"
            value={sds.skinCorrosion}
            isDark={isDark}
          />
          <InfoRow label="Eye Damage" value={sds.eyeDamage} isDark={isDark} />
          <InfoRow
            label="Carcinogenicity"
            value={sds.carcinogenicity}
            isDark={isDark}
          />
        </SDSSection>

        {/* Section 12: Ecological Information */}
        <SDSSection title="12. Ecological Information" isDark={isDark}>
          <InfoRow
            label="Ecotoxicity"
            value={sds.ecotoxicity}
            isDark={isDark}
          />
          <InfoRow
            label="Persistence"
            value={sds.persistence}
            isDark={isDark}
          />
          <InfoRow
            label="Bioaccumulation"
            value={sds.bioaccumulation}
            isDark={isDark}
          />
        </SDSSection>

        {/* Section 13: Disposal */}
        <SDSSection title="13. Disposal Considerations" isDark={isDark}>
          <InfoRow
            label="Waste Disposal"
            value={sds.wasteDisposal}
            isDark={isDark}
            multiline
          />
          <InfoRow
            label="Container Disposal"
            value={sds.containerDisposal}
            isDark={isDark}
            multiline
          />
        </SDSSection>

        {/* Section 14: Transport */}
        <SDSSection title="14. Transport Information" isDark={isDark}>
          <InfoRow label="UN Number" value={sds.unNumber} isDark={isDark} />
          <InfoRow
            label="Shipping Name"
            value={sds.shippingName}
            isDark={isDark}
          />
          <InfoRow
            label="Hazard Class"
            value={sds.hazardClass}
            isDark={isDark}
          />
          <InfoRow
            label="Packing Group"
            value={sds.packingGroup}
            isDark={isDark}
          />
        </SDSSection>

        {/* Section 15: Regulatory */}
        <SDSSection title="15. Regulatory Information" isDark={isDark}>
          {sds.safetyHealthEnvironmental.map((info, index) => (
            <BulletPoint key={index} text={info} isDark={isDark} />
          ))}
        </SDSSection>

        {/* Section 16: Other Information */}
        <SDSSection title="16. Other Information" isDark={isDark}>
          <InfoRow label="Prepared By" value={sds.preparedBy} isDark={isDark} />
          <InfoRow
            label="Revision Date"
            value={sds.revisionDate}
            isDark={isDark}
          />
          <InfoRow
            label="Revision Number"
            value={sds.revisionNumber}
            isDark={isDark}
          />
        </SDSSection>

        <View
          className="p-4 mb-8 mx-4 rounded-lg"
          style={{ backgroundColor: isDark ? "#1F2C34" : "#F7F9F9" }}
        >
          <Text
            className="text-xs text-center"
            style={{ color: isDark ? "#8696A0" : "#536471" }}
          >
            This SDS is provided for informational purposes only. Always consult
            with qualified personnel before handling this chemical.
          </Text>
        </View>
      </View>
    </ParallaxScrollView>
  );
}

// Helper Components
function SDSSection({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View className="mb-6 px-4">
      <Text className="text-lg font-bold mb-3" style={{ color: "#10B981" }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SubSection({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View className="mb-3">
      <Text
        className="text-base font-semibold mb-2"
        style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  isDark,
  multiline,
}: {
  label: string;
  value: string;
  isDark: boolean;
  multiline?: boolean;
}) {
  return (
    <View className="mb-3">
      <Text
        className="text-sm font-semibold mb-1"
        style={{ color: isDark ? "#8696A0" : "#536471" }}
      >
        {label}
      </Text>
      <Text
        className="text-base"
        style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
      >
        {value}
      </Text>
    </View>
  );
}

function BulletPoint({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <View className="flex-row mb-2">
      <Text className="mr-2" style={{ color: "#10B981" }}>
        •
      </Text>
      <Text
        className="flex-1 text-sm"
        style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
      >
        {text}
      </Text>
    </View>
  );
}

function PropertyCard({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View className="w-1/2 p-2">
      <View
        className="p-3 rounded-lg"
        style={{ backgroundColor: isDark ? "#1F2C34" : "#F7F9F9" }}
      >
        <Text
          className="text-xs font-semibold mb-1"
          style={{ color: isDark ? "#8696A0" : "#536471" }}
        >
          {label}
        </Text>
        <Text
          className="text-sm font-medium"
          style={{ color: isDark ? "#E9EDEF" : "#0F1419" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
