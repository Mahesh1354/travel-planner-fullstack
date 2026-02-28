package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.TravelTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TravelTipRepository extends JpaRepository<TravelTip, Long> {

    List<TravelTip> findByDestinationCountry(String country);

    List<TravelTip> findByDestinationCountryAndDestinationCity(String country, String city);

    List<TravelTip> findByTipType(TravelTip.TipType tipType);

    @Query("SELECT t FROM TravelTip t WHERE " +
            "(t.destinationCountry = :country OR :country IS NULL) AND " +
            "(t.destinationCity = :city OR :city IS NULL) AND " +
            "(t.tipType = :tipType OR :tipType IS NULL)")
    List<TravelTip> findTips(@Param("country") String country,
                             @Param("city") String city,
                             @Param("tipType") TravelTip.TipType tipType);

    @Query("SELECT t FROM TravelTip t WHERE t.expiryDate IS NULL OR t.expiryDate > :currentDate")
    List<TravelTip> findValidTips(@Param("currentDate") LocalDate currentDate);
}