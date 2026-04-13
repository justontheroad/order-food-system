package com.ordering.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.entity.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

/**
 * 会员 Mapper 接口
 */
@Mapper
public interface MemberMapper extends BaseMapper<Member> {

    @Select("SELECT m.*, u.username, u.phone, ml.name as level_name, ml.discount as level_discount " +
            "FROM members m " +
            "LEFT JOIN users u ON m.user_id = u.id " +
            "LEFT JOIN member_levels ml ON m.level_id = ml.id " +
            "ORDER BY m.id DESC")
    Page<Map<String, Object>> selectMembersWithDetails(Page<Map<String, Object>> page);
}
